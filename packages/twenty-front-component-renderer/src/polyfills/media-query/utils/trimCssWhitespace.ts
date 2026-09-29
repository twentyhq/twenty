import { CSS_WHITESPACE_CHARACTER_CLASS } from '@/polyfills/media-query/constants/CssWhitespaceCharacterClass';

const CSS_WHITESPACE_CHARACTER_PATTERN = new RegExp(
  CSS_WHITESPACE_CHARACTER_CLASS,
);

const isCssWhitespaceCharacter = (character: string): boolean =>
  CSS_WHITESPACE_CHARACTER_PATTERN.test(character);

export const trimCssWhitespace = (value: string): string => {
  let startIndex = 0;
  let endIndex = value.length;

  while (startIndex < endIndex && isCssWhitespaceCharacter(value[startIndex])) {
    startIndex += 1;
  }

  while (
    endIndex > startIndex &&
    isCssWhitespaceCharacter(value[endIndex - 1])
  ) {
    endIndex -= 1;
  }

  return value.slice(startIndex, endIndex);
};
