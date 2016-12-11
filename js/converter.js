// Function for generating a 6 hexidecimal id for cards.
function nid() {
  var text = '';
  var possible = 'abcdefg0123456789';

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function buildGameBag(name, allCards) {
  var chestObject;
  var gameBag;
  var battlefield;
  var characterDeck;
  var otherDeck;

  // How to Build a Game Bag
  // chestObject = cloned emptyObject (no variables needed)
  chestObject = JSON.parse(JSON.stringify(emptyObject));

  // gameBag = cloned emptyBag
  gameBag = JSON.parse(JSON.stringify(emptyBag));

  // gameBag.Nickname
  // gameBag.Description
  gameBag.Nickname = name;
  gameBag.Description = 'Deck from CardGameDB.com Converted by SWD-Dropzone.';

  // === Battlefield Card ===
  battlefield = JSON.parse(JSON.stringify(allCards.battlefields.cardSet[0]));

  // === Character Deck ===
  // characterDeck = cloned emptyDeck
  characterDeck = JSON.parse(JSON.stringify(emptyDeck));

  // characterDeck.Nickname
  characterDeck.Nickname = 'Characters';

  // characterDeck.GUID
  characterDeck.GUID = nid();

  // characterDeck.DeckIDs
  characterDeck.DeckIDs = allCards.characters.cardList;

  // characterDeck.CustomDeck{} this will be a structure
  for (let customDeckID of allCards.characters.customDeckList) {
    characterDeck.CustomDeck[customDeckID] = customDecks[customDeckID];
  }

  // push cards into characterDeck.ContainedObjects[]
  for (let singleCard of allCards.characters.cardSet) {
    characterDeck.ContainedObjects.push(singleCard);
  }

  // === Game Deck
  // gameDeck = cloned emptyDeck
  gameDeck = JSON.parse(JSON.stringify(emptyDeck));

  // gameDeck.Nickname
  gameDeck.Nickname = 'Events, Supports, Upgrades';

  // gameDeck.GUID
  gameDeck.GUID = nid();

  // gameDeck.Transform.rotZ
  gameDeck.Transform.rotZ = 180.0;

  // gameDeck.DeckIDs
  gameDeck.DeckIDs = allCards.others.cardList;

  // gameDeck.CustomDeck{} this will be a structure
  for (let customDeckID of allCards.others.customDeckList) {
    gameDeck.CustomDeck[customDeckID] = customDecks[customDeckID];
  }

  // push cards into gameDeck.ContainedObjects[]
  for (let singleCard of allCards.others.cardSet) {
    console.log(singleCard);
    gameDeck.ContainedObjects.push(singleCard);
  }

  // ================
  // = Cleanup ======
  // ================
  // push Battlefield Card into gameBag.ContainedObjects[]
  gameBag.ContainedObjects.push(battlefield);

  // push Character Deck into gameBag.ContainedObjects[]
  gameBag.ContainedObjects.push(characterDeck);

  // push Game Deck into gameBag.ContainedObjects[]
  gameBag.ContainedObjects.push(gameDeck);

  // push gameBag into chestObject.ObjectStates[]
  chestObject.ObjectStates.push(gameBag);
  return chestObject;
}

function findCardID(cgdbName) {
  for (x in cgdblinkage) {
    if (cgdblinkage[x].CGDBName == cgdbName) {
      return cgdblinkage[x];
    }
  };

  return 'nothing';
}

function convert() {
  // Set up an empty bag structure
  var cleanBag = {
    characters: { cardList: [], cardSet: [], customDeckList: [] },
    battlefields: { cardList: [], cardSet: [], customDeckList: [] },
    others: { cardList: [], cardSet: [], customDeckList: [] },
  };

  var saveFileName = document.getElementById('saveFileName').value;
  var tmpCard;
  var garbageBag = [];
  var lines = document.getElementById('cgdbTextArea').value.split('\n');

  for (let line of lines) {
    // clean the line
    cleanLine = line.substr(3).trim();
    elite = false;

    // look for cards should start with either 1x or 2x
    switch (line.substr(0, 2)){
      case '1x':
        doLoop = 1;
      break;
      case '2x':
        doLoop = 2;
        if (findCardID(cleanLine).unique) {
          elite = true;
        }

      break;
      default:
        doLoop = 0;
    }
    for (let i = 1; i <= doLoop; i++) {
      var cleanCard;
      var tmpCard = findCardID(cleanLine);

      // console.log(tmpCard);
      switch (tmpCard.CGDBType){
        case 'battlefield':
          cleanBag.battlefields.cardList.push(tmpCard.CardID);
          for (var x = 0; x < battlefields.length; x++) {
            if (battlefields[x].CardID == tmpCard.CardID) {
              if (cleanBag.battlefields.customDeckList.indexOf(
                parseInt(tmpCard.CardID.toString().substring(0, 2))) === -1) {
                cleanBag.battlefields.customDeckList.push(
                parseInt(tmpCard.CardID.toString().substring(0, 2))
                );
              }

              cleanCard = JSON.parse(JSON.stringify(battlefields[x]));
              if (i == 2) {
                cleanCard.GUID = nid();
              }

              cleanBag.battlefields.cardSet.push(cleanCard);
              break;
            }
          }

        break;
        case 'character':
          cleanBag.characters.cardList.push(tmpCard.CardID);
          for (var x = 0; x < characters.length; x++) {
            if (characters[x].CardID == tmpCard.CardID) {
              if (cleanBag.characters.customDeckList.indexOf(
                parseInt(tmpCard.CardID.toString().substring(0, 2))) === -1) {
                cleanBag.characters.customDeckList.push(
                parseInt(tmpCard.CardID.toString().substring(0, 2))
                );
              }

              cleanCard = JSON.parse(JSON.stringify(characters[x]));
              if (i == 2) {
                cleanCard.GUID = nid();
              }

              if (elite) {
                cleanCard.Description = 'elite';
                i = 10;
              }

              cleanBag.characters.cardSet.push(cleanCard);
              break;
            }
          }

        break;
        case 'event':
          cleanBag.others.cardList.push(tmpCard.CardID);
          for (var x = 0; x < events.length; x++) {
            if (events[x].CardID == tmpCard.CardID) {
              if (cleanBag.others.customDeckList.indexOf(
                parseInt(tmpCard.CardID.toString().substring(0, 2))) === -1) {
                cleanBag.others.customDeckList.push(
                parseInt(tmpCard.CardID.toString().substring(0, 2))
                );
              }

              cleanCard = JSON.parse(JSON.stringify(events[x]));
              if (i == 2) {
                cleanCard.GUID = nid();
              }

              cleanBag.others.cardSet.push(cleanCard);
              break;
            }
          }

        break;
        case 'support':
          cleanBag.others.cardList.push(tmpCard.CardID);
          for (var x = 0; x < supports.length; x++) {
            if (supports[x].CardID == tmpCard.CardID) {
              if (cleanBag.others.customDeckList.indexOf(
                parseInt(tmpCard.CardID.toString().substring(0, 2))) === -1) {
                cleanBag.others.customDeckList.push(
                parseInt(tmpCard.CardID.toString().substring(0, 2))
                );
              }

              cleanCard = JSON.parse(JSON.stringify(supports[x]));
              if (i == 2) {
                cleanCard.GUID = nid();
              }

              cleanBag.others.cardSet.push(cleanCard);
              break;
            }
          }

        break;
        case 'upgrade':
          cleanBag.others.cardList.push(tmpCard.CardID);
          for (var x = 0; x < upgrades.length; x++) {
            if (upgrades[x].CardID == tmpCard.CardID) {
              if (cleanBag.others.customDeckList.indexOf(
                parseInt(tmpCard.CardID.toString().substring(0, 2))) === -1) {
                cleanBag.others.customDeckList.push(
                parseInt(tmpCard.CardID.toString().substring(0, 2))
                );
              }

              cleanCard = JSON.parse(JSON.stringify(upgrades[x]));
              if (i == 2) {
                cleanCard.GUID = nid();
              }

              cleanBag.others.cardSet.push(cleanCard);
              break;
            }
          }

        break;
      };
    }
  };

  saveBag = buildGameBag(saveFileName, cleanBag);
  document.getElementById('ttsTextArea').value = JSON.stringify(saveBag, null, '\t');
  document.getElementById('downloadButton').style.visibility = 'visible';
}

function download() {
  var text = document.getElementById('ttsTextArea').value;
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, document.getElementById('saveFileName').value + '.json');
};
