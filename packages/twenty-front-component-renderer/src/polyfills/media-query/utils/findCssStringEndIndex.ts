import { CSS_ESCAPE_CHARACTER } from '@/polyfills/media-query/constants/CssEscapeCharacter';
import { findCssEscapeEndIndex } from '@/polyfills/media-query/utils/findCssEscapeEndIndex';

const CSS_NEWLINE_CHARACTERS = new Set(['\n', '\r', '\f']);

type FindCssStringEndIndexInput = {
  cssText: string;
  stringStartIndex: number;
};

export const findCssStringEndIndex = ({
  cssText,
  stringStartIndex,
}: FindCssStringEndIndexInput): number => {
  const quoteCharacter = cssText[stringStartIndex];

  let characterIndex = stringStartIndex + 1;

  while (characterIndex < cssText.length) {
    const character = cssText[characterIndex];

    if (character === CSS_ESCAPE_CHARACTER) {
      characterIndex = findCssEscapeEndIndex({
        cssText,
        escapeStartIndex: characterIndex,
      });
      continue;
    }

    const isStringTerminator =
      character === quoteCharacter || CSS_NEWLINE_CHARACTERS.has(character);

    if (isStringTerminator) {
      return characterIndex + 1;
    }

    characterIndex += 1;
  }

  return cssText.length;
};
