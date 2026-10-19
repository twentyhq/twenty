import { isDefined } from 'twenty-shared/utils';

import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';
import { CSS_ESCAPE_CHARACTER } from '@/polyfills/media-query/constants/CssEscapeCharacter';
import { type CssTextSegment } from '@/polyfills/media-query/types/CssTextSegment';
import { findCssEscapeEndIndex } from '@/polyfills/media-query/utils/findCssEscapeEndIndex';

const URL_FUNCTION_PREFIX = 'url(';

const URL_TOKEN_END_CHARACTER = ')';

const CSS_QUOTE_CHARACTERS = new Set(['"', "'"]);

const CSS_IDENTIFIER_CHARACTER_REGEX = /[\w\-\u0080-\uffff]/;

type ReadCssUrlTokenSegmentInput = {
  cssText: string;
  startIndex: number;
};

// An unquoted url() is a single token, so comment markers and braces in it
// are part of the URL rather than CSS syntax.
export const readCssUrlTokenSegment = ({
  cssText,
  startIndex,
}: ReadCssUrlTokenSegmentInput): CssTextSegment | undefined => {
  if (cssText[startIndex] !== 'u' && cssText[startIndex] !== 'U') {
    return undefined;
  }

  const previousCharacter = cssText[startIndex - 1];
  const continuesIdentifier =
    isDefined(previousCharacter) &&
    CSS_IDENTIFIER_CHARACTER_REGEX.test(previousCharacter);
  const urlFunctionEndIndex = startIndex + URL_FUNCTION_PREFIX.length;

  if (
    continuesIdentifier ||
    cssText.slice(startIndex, urlFunctionEndIndex).toLowerCase() !==
      URL_FUNCTION_PREFIX
  ) {
    return undefined;
  }

  let characterIndex = urlFunctionEndIndex;

  while (ASCII_WHITESPACE_REGEX.test(cssText[characterIndex] ?? '')) {
    characterIndex += 1;
  }

  if (CSS_QUOTE_CHARACTERS.has(cssText[characterIndex])) {
    return undefined;
  }

  while (characterIndex < cssText.length) {
    const character = cssText[characterIndex];

    if (character === CSS_ESCAPE_CHARACTER) {
      characterIndex = findCssEscapeEndIndex({
        cssText,
        escapeStartIndex: characterIndex,
      });
      continue;
    }

    characterIndex += 1;

    if (character === URL_TOKEN_END_CHARACTER) {
      break;
    }
  }

  return {
    text: cssText.slice(startIndex, characterIndex),
    endIndex: characterIndex,
    isPlainCharacter: false,
  };
};
