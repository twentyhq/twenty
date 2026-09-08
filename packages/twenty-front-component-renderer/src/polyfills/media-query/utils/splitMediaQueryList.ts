import { isDefined } from 'twenty-shared/utils';

const CLOSING_DELIMITERS_BY_OPENING_DELIMITER = new Map([
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
]);

export const splitMediaQueryList = (mediaQueryList: string): string[] => {
  const queries: string[] = [];
  const closingDelimiters: string[] = [];

  let queryStartIndex = 0;
  let quoteCharacter: string | null = null;
  let isInsideComment = false;

  for (
    let characterIndex = 0;
    characterIndex < mediaQueryList.length;
    characterIndex += 1
  ) {
    const character = mediaQueryList[characterIndex];
    const nextCharacter = mediaQueryList[characterIndex + 1];

    if (isInsideComment) {
      if (character === '*' && nextCharacter === '/') {
        isInsideComment = false;
        characterIndex += 1;
      }
      continue;
    }

    if (character === '\\') {
      if (
        nextCharacter === '\r' &&
        mediaQueryList[characterIndex + 2] === '\n'
      ) {
        characterIndex += 1;
      }
      characterIndex += 1;
      continue;
    }

    if (isDefined(quoteCharacter)) {
      if (
        character === quoteCharacter ||
        character === '\n' ||
        character === '\r' ||
        character === '\f'
      ) {
        quoteCharacter = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quoteCharacter = character;
      continue;
    }

    if (character === '/' && nextCharacter === '*') {
      isInsideComment = true;
      characterIndex += 1;
      continue;
    }

    const closingDelimiter =
      CLOSING_DELIMITERS_BY_OPENING_DELIMITER.get(character);

    if (isDefined(closingDelimiter)) {
      closingDelimiters.push(closingDelimiter);
      continue;
    }

    if (character === closingDelimiters[closingDelimiters.length - 1]) {
      closingDelimiters.pop();
      continue;
    }

    if (character === ',' && closingDelimiters.length === 0) {
      queries.push(mediaQueryList.slice(queryStartIndex, characterIndex));
      queryStartIndex = characterIndex + 1;
    }
  }

  queries.push(mediaQueryList.slice(queryStartIndex));

  return queries;
};
