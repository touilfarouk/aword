// Translation service using CDN dictionary
class TranslationService {
  constructor() {
    this.cache = new Map();
    this.fallbackTranslations = {
      // Fallback translations for common words if API fails
      "tiger": "tigre", "horse": "cheval", "sheep": "mouton", "mouse": "souris", "whale": "baleine",
      "apple": "pomme", "bread": "pain", "earth": "terre", "ocean": "océan", "happy": "heureux",
      "brain": "cerveau", "chair": "chaise", "black": "noir", "green": "vert", "beach": "plage"
    };
  }

  async getTranslation(word, targetLang = 'fr') {
    // Check cache first
    const cacheKey = `${word}-${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Try fallback dictionary first for common words
    if (this.fallbackTranslations[word.toLowerCase()]) {
      const translation = this.fallbackTranslations[word.toLowerCase()];
      this.cache.set(cacheKey, translation);
      return translation;
    }

    // Use a free translation API (MyMemory API)
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${targetLang}`);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData.translatedText) {
        const translation = data.responseData.translatedText;
        this.cache.set(cacheKey, translation);
        return translation;
      }
    } catch (error) {
      console.warn('Translation API failed, using fallback:', error);
    }

    // Final fallback: return the original word
    this.cache.set(cacheKey, word);
    return word;
  }
}

const translationService = new TranslationService();

// Word categories for English learning
const wordCategories = {
  animals: ["tiger", "horse", "sheep", "mouse", "whale", "shark", "eagle", "snake", "zebra", "lemur", "panda", "koala", "camel", "goose", "moose", "otter", "coral", "crane", "gecko", "hyena"],
  food: ["apple", "bread", "cream", "grape", "honey", "lemon", "melon", "olive", "onion", "peach", "pearl", "raisin", "sugar", "toast", "vine", "yeast", "bacon", "cocoa", "flour", "salsa"],
  nature: ["earth", "ocean", "river", "stone", "cloud", "storm", "flora", "grass", "leaf", "petal", "root", "seed", "soil", "tree", "bloom", "dew", "frost", "hail", "mist", "snow"],
  daily: ["chair", "table", "clock", "phone", "light", "paper", "pencil", "brush", "towel", "blank", "couch", "dress", "shirt", "shoes", "socks", "wallet", "keys", "mirror", "shelf", "frame"],
  emotions: ["happy", "sadly", "angry", "proud", "brave", "calm", "eager", "glad", "joy", "loved", "scared", "shock", "tears", "cheer", "dream", "fear", "faith", "grace", "heart", "smile"],
  body: ["brain", "chest", "elbow", "finger", "foot", "hand", "heart", "knee", "liver", "mouth", "muscle", "nerve", "organ", "palms", "spine", "stomach", "thigh", "throat", "veins", "waist"],
  colors: ["amber", "azure", "black", "blond", "brown", "coral", "cream", "flax", "gray", "green", "khaki", "lemon", "lilac", "lime", "navy", "olive", "pearl", "pink", "red", "snow"],
  travel: ["beach", "hotel", "plane", "train", "boat", "cabin", "camp", "city", "field", "forest", "harbor", "island", "mount", "palace", "park", "port", "road", "route", "trail", "villa"]
};

let currentCategory = 'animals';

// Original word dictionaries (keeping for compatibility)
const matchDict = ["cigar", "rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve", "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate", "feign", "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry", "react", "batty", "pride", "floss", "helix", "croak", "staff", "paper", "unfed", "whelp", "trawl", "outdo", "adobe", "crazy", "sower", "repay", "digit", "crate", "cluck", "spike", "mimic", "pound", "maxim", "linen", "unmet", "flesh", "booby", "forth", "first", "stand", "belly", "ivory", "seedy", "print", "yearn", "drain", "bribe", "stout", "panel", "crass", "flume", "offal", "agree", "error", "swirl", "argue", "bleed", "delta", "flick", "totem", "wooer", "front", "shrub", "parry", "biome", "lapel", "start", "greet", "goner", "golem", "lusty", "loopy", "round", "audit", "lying", "gamma", "labor", "islet", "civic", "forge", "corny", "moult", "basic", "salad", "agate", "spicy", "spray", "essay", "fjord", "spend", "kebab", "guild", "aback", "motor", "alone", "hatch", "hyper", "thumb", "dowry", "ought", "belch", "dutch", "pilot", "tweed", "comet", "jaunt", "enema", "steed", "abyss", "growl", "fling", "dozen", "boozy", "erode", "world", "gouge", "click", "briar", "great", "altar", "pulpy", "blurt", "coast", "duchy", "groin", "fixer", "group", "rogue", "badly", "smart", "pithy", "gaudy", "chill", "heron", "vodka", "finer", "surer", "radio", "rouge", "perch", "retch", "wrote", "clock", "tilde", "store", "prove", "bring", "solve", "cheat", "grime", "exult", "usher", "epoch", "triad", "break", "rhino", "viral", "conic", "masse", "sonic", "vital", "trace", "using", "peach", "champ", "baton", "brake", "pluck", "craze", "gripe", "weary", "picky", "acute", "ferry", "aside", "tapir", "troll", "unify", "rebus", "boost", "truss", "siege", "tiger", "banal", "slump", "crank", "gorge", "query", "drink", "favor", "abbey", "tangy", "panic", "solar", "shire", "proxy", "point", "robot", "prick", "wince", "crimp", "knoll", "pulp", "ranch", "relay", "foist", "whoop", "taunt", "cheek", "sweep", "whack", "squat", "stack", "swoon", "prank", "fritz", "staid", "skunk", "minty", "slyly", "poppy", "bumpy", "hilly", "silly"];

// Combined word dictionary for validation (all category words + match words)
const wordDict = [...matchDict, ...Object.values(wordCategories).flat()];

const numWords = wordDict.length;
function getRandomWord() {
  const categorySelect = document.getElementById('category');
  const selectedCategory = categorySelect ? categorySelect.value : 'all';
  
  let wordPool;
  if (selectedCategory === 'all') {
    wordPool = wordDict;
  } else {
    wordPool = wordCategories[selectedCategory] || [];
  }
  
  // Filter to only 5-letter words
  wordPool = wordPool.filter(word => word.length === 5);
  
  // If no 5-letter words in category, fall back to all 5-letter words
  if (wordPool.length === 0) {
    wordPool = wordDict.filter(word => word.length === 5);
  }
  
  const idx = Math.floor(wordPool.length * Math.random());
  return wordPool[idx];
}

const wordLength = 5;
const maxGuesses = 6;

function Tile() {
  const element = document.createElement('div');
  element.classList.add('tile-container');
  
  const tile = document.createElement('div');
  tile.classList.add('tile');
  element.appendChild(tile)
  
  let value = ''
  let state = 'tbd'
  
  function get() {
    return value;
  }
  
  function set(letter) {
    tile.innerHTML = letter
    value = letter
  }
  
  function clear (letter) {
    tile.innerHTML = '';
    value = '';
    tile.classList.remove('correct','oop','wrong');
  }
  
  const stateActions = {
    'correct': setCorrect,
    'oop': setOutOfPlace,
    'wrong': setWrong
  }
  
  function setCorrect() 
  {
    tile.classList.add('correct');
  }
  
  function setOutOfPlace() 
  {
    tile.classList.add('oop');
  }
  
  function setWrong() 
  {
    tile.classList.add('wrong');
  }
  
  function setState(newState) {
    state = newState
    if(stateActions[state])
       stateActions[state]();
  }
  
  function getState() {
    return state
  }
  
  return {
    element,
    get,
    set,
    clear,
    setState,
    getState
  }
}

function createGuessRow() {
  // Create container
  const element = document.createElement('div');
  element.classList.add('guess');
  
  let idx = 0

  // Add tiles
  let tiles = [];
  let i = 0;
  for(;i<wordLength;i++) {
    const tile = Tile();
    element.appendChild(tile.element);
    tiles.push(tile);
  }
  
  function appendLetter(letter) {
    if(idx >= wordLength) return
    tiles[idx].set(letter)
    idx++
  }
  
  function deleteLetter() {
    if(idx <= 0) return
    idx--
    tiles[idx].clear()
  }
  
  function getWord() {
    return tiles.reduce((prevValue, curTile) => {
      return prevValue += curTile.get()
    }, '')
  }
  
  function clear() {
    tiles.forEach(tile => tile.clear())
    idx = 0
  }
  
  return {
    element,
    tiles,
    appendLetter,
    deleteLetter,
    getWord,
    clear
  }
}

function createGameBoard() {
  // Create container
  const element = document.createElement('div')
  element.classList.add('board')
  
  // Add rows
  let guesses = [];
  let i = 0;
  for(;i<maxGuesses;i++) {
    const guess = createGuessRow();
    element.appendChild(guess.element);
    guesses.push(guess);
  }
  
  function clear() {
    guesses.forEach(guess => guess.clear())
  }
  
  return {
    element,
    guesses,
    clear
  }
}

// Keyboard
const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

const keyboardLayout = [['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['enter','z','x','c','v','b','n','m','delete']]

function createKey(letter, onClick) {
  const element = document.createElement('button');
  element.classList.add('key');
  element.dataset.value = letter
  
  // Set icons for special keys
  if (letter.toLowerCase() === 'enter') {
    element.innerHTML = '↵';
  } else if (letter.toLowerCase() === 'delete') {
    element.innerHTML = '←';
  } else {
    element.innerHTML = letter.toUpperCase();
  }
  
  element.addEventListener('click', onClick)
  let state = 'tbd'
  
  const stateActions = {
    'correct': setCorrect,
    'oop': setOutOfPlace,
    'wrong': setWrong
  }
  
  function setCorrect() 
  {
    clear()
    element.classList.add('correct');
  }
  
  function setOutOfPlace() 
  {
    clear()
    element.classList.add('oop');
  }
  
  function setWrong() 
  {
    clear()
    element.classList.add('wrong');
  }
  
  function setState(newState) {
    state = newState
    
    if(stateActions[state])
      stateActions[state]()
  }
  
  function getState() {
    return state
  }
  
  function clear() {
    element.classList.remove('correct', 'oop', 'wrong');
  }
  
  return {
    letter,
    element,
    setState,
    getState,
    clear
  }
}

function createKeyboardRow(row, onClick) {
  const element = document.createElement('div')
  element.classList.add('keyboard-row')
  
  const keys = {}
  row.forEach(letter => {
    const key = createKey(letter, onClick);
    keys[letter] = key;
    element.appendChild(key.element);
  })
  
  return { 
    element,
    keys
  }
}

function createKeyboad() {
  const element = document.createElement('div')
  element.classList.add('keyboard')
  
  const keyMap = {}
  keyboardLayout.forEach(keyRow => {
    const row = createKeyboardRow(keyRow, handleClick)
    element.appendChild(row.element)
    Object.assign(keyMap, row.keys)
  })
  
  let callback;
  
  function handleClick(value) {
    if(!callback) return;
    callback(value.srcElement)
  }
  
  function addClickCallback(fn) {
  if(!(fn && typeof fn === 'function')) return
    callback = fn
  }
  
  function removeClickCallback() {
    callback = undefined
  }
  
  function clear() {
    Object.keys(keyMap).forEach(key => keyMap[key].clear())
  }
  
  return {
    element,
    keyMap,
    addClickCallback,
    removeClickCallback,
    clear
  }
}

const keyboard = createKeyboad();

const keyboardElement = document.getElementById('keyboard')
keyboardElement.appendChild(keyboard.element)

// Game Element
const gameEl = document.getElementById('game')

// Messages
function MessageDisplay() {
  const element = document.createElement('div');
  element.classList.add('message', 'hide');
  
  const text = document.createElement('h4');
  text.classList.add('text');
  text.innerHTML = 'MESSAGE TEST'
  
  element.appendChild(text);
  
  let isVisible = false;
  const duration = 1000;
  
  function show(value) {
    if(isVisible) return;
    
    if(!(value && typeof value === 'string')) return;
       
    text.innerHTML = value;
    
    element.classList.remove('hide');
    element.classList.add('show');
    isVisible = true;
    
    setTimeout(hide, duration);
  }
  
  function hide() {
    element.classList.remove('show');
    element.classList.add('hide');
    isVisible = false;
  }
  
  return {
    element,
    show
  }
}

// Gameplay
function Game() {
  let curGuessIndex = 0;
  let curGuessLetterIndex = 0;
  let curGuessWord = ''
  
  // Create Game Board
  const gameBoard = createGameBoard();

  function GuessIterator() {
    const guesses = gameBoard.guesses
    const maxIdx = guesses.length-1
    let idx = -1
    let guess = guesses[idx]
    return {
      next: function() {
        if (idx >= maxIdx) return { 
          value: undefined,
          done: true
        }

        idx++
        guess = guesses[idx]
        return { 
          value: guess,
          done: false
        }
      }
    }
  }
  
  let guessItr, guess, gameRunning = false;
  
  let matchWord = ''
  function setMatchWord() {
    matchWord = getRandomWord()
    // Hide answer for normal gameplay
    const footer = document.getElementById('footer');
    if (footer) {
      footer.innerHTML = '';
    }
  }
  
  // Render
  const container = document.getElementById('game-container');
  container.appendChild(gameBoard.element);
  
  const message = MessageDisplay()
  container.appendChild(message.element)

  function appendGuessEntry(letter) {    
    if(!guess.value) return
      
    if(!(letter && typeof letter === 'string')) return;

    guess.value.appendLetter(letter)
  }

  function deleteGuessEntry() {
  if(!guess.value) return
  guess.value.deleteLetter()
}

  function startGame() {
    gameBoard.clear();
    removeListseners();
    keyboard.clear();
    
    guessItr = new GuessIterator();
    guess = guessItr.next();
    
    setMatchWord();
    addListeners();
  }
  
  function endGame() {
    removeListseners();
  }
  
  function giveUp() {
    message.show(matchWord.toUpperCase())
    displayTranslation(matchWord);
  }
  
  function addListeners() {
    keyboard.addClickCallback(onKeyboardClick)
    window.addEventListener('keydown', onButtonClick)
  }
  
  function removeListseners() {
    keyboard.removeClickCallback()
    window.removeEventListener('keydown', onButtonClick)
  }
  
  let actions = {
    'delete': deleteGuessEntry,
    'backspace': deleteGuessEntry,
    'enter': submitGuess,
    'guess': value => {
      appendGuessEntry(value)
    }
  }

  // Handle io click
  function onButtonClick(evt) {
    parseAction(evt.key)
  }
  
  // Handle Keyboard Letter Click
  function onKeyboardClick(el) {
    parseAction(el.dataset.value);
  }

  function parseAction(key) {
    if(alphabet.includes(key)) {
      actions.guess(key);
      return;
    }

    const action = key.toLowerCase()
    if(!actions[action]) return;

    actions[action]();
  }

  function submitGuess() {
    const word = guess.value.getWord();
    
    if(word.length !== wordLength) {
      handleShortWord();
      return
    }
    
    if(!wordDict.includes(word.toLowerCase())) {
      handleInvalidWord();
      return ;
    }
    
    const correctGuess = evaluateTiles()
    
    if(!correctGuess) {
      guess = guessItr.next();
      
       if(guess.done === true)
         message.show(matchWord.toUpperCase())
      
      return;
    }
    
    handleCorrectGuess();
    endGame();
  }
  
  function evaluateTiles() {
    let matchLetters = [...matchWord],
        unmatchedLetters,
        matchLetter,
        tileValue,
        unmatched,
        correctLetters = 0
    
    unmatchedLetters = matchLetters.reduce((obj, letter) => {
      if(obj[letter]) {
        obj[letter]++;
        return obj;
      }
      
      obj[letter] = 1;
      return obj;
    }, {})
    
    // Step through the tiles
    const tilesToReEvaluate = []
    guess.value.tiles.forEach((tile, idx) => {
        tileValue = tile.get();
        // Letter at the same index in the match word
        matchLetter = matchLetters[idx];
      
        // Is it a match?
        if(tileValue === matchLetter) {
          tile.setState('correct');
          updateKeyboard(tileValue, 'correct');
          unmatchedLetters[tileValue]--;
          correctLetters++;
          return;
        }
      
        tilesToReEvaluate.push(tile)
    })
    
    tilesToReEvaluate.forEach((tile, idx) => {
        tileValue = tile.get();
      
        // Letter at the same index in the match word
        matchLetter = matchLetters[idx];
      
        // Out of place?
        if(unmatchedLetters[tileValue] > 0) {
          tile.setState('oop');
          updateKeyboard(tileValue, 'oop')
          unmatchedLetters[tileValue]--;
          return;
        }

        tile.setState('wrong');
        updateKeyboard(tileValue, 'wrong');
    })
    
    if(correctLetters === wordLength)
       return true;
    
    return false;
  }
  
  const keyboardStatePriority = {
    'correct': 0,
    'oop': 1,
    'wrong': 2,
    'tbd': 3
  }
  function updateKeyboard(key, state) {
    const curState = keyboard.keyMap[key].getState();
    
    const curPriority = keyboardStatePriority[curState];
    const newPriority = keyboardStatePriority[state];
    
    if(newPriority >= curPriority) return;
    
    keyboard.keyMap[key].setState(state);
  }

  function handleShortWord() {
    message.show(`You need ${wordLength} letters`)
  }

  function handleInvalidWord() {
    message.show('Invalid Word')
  }

  async function displayTranslation(word) {
    const footer = document.getElementById('footer');
    if (footer) {
      // Show loading state
      footer.innerHTML = `
        <div class="translation-container">
          <h3>Translation</h3>
          <p><strong>English:</strong> ${word.toUpperCase()}</p>
          <p><strong>Français:</strong> Loading...</p>
        </div>
      `;

      try {
        const frenchTranslation = await translationService.getTranslation(word, 'fr');
        footer.innerHTML = `
          <div class="translation-container">
            <h3>Translation</h3>
            <p><strong>English:</strong> ${word.toUpperCase()}</p>
            <p><strong>Français:</strong> ${frenchTranslation.charAt(0).toUpperCase() + frenchTranslation.slice(1)}</p>
          </div>
        `;
      } catch (error) {
        console.error('Translation failed:', error);
        footer.innerHTML = `
          <div class="translation-container">
            <h3>Translation</h3>
            <p><strong>English:</strong> ${word.toUpperCase()}</p>
            <p><strong>Français:</strong> ${word}</p>
          </div>
        `;
      }
    }
  }

  function handleCorrectGuess() {
    message.show(`YAY, CONGRATS!`)
    displayTranslation(matchWord);
  }

  return {
    startGame,
    giveUp
  }
}

theGame = new Game();
theGame.startGame();

newGameButton.addEventListener('click', (e) => { 
  theGame.startGame();
  e.target.blur()
});
giveUpButton.addEventListener('click', (e) => { 
  theGame.giveUp();
  e.target.blur()
});

// Category selector event listener
const categorySelect = document.getElementById('category');
if (categorySelect) {
  categorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    theGame.startGame();
  });
}