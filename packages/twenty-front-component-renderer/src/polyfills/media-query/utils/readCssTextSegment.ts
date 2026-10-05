import { CSS_ESCAPE_CHARACTER } from '@/polyfills/media-query/constants/CssEscapeCharacter';
import { type CssTextSegment } from '@/polyfills/media-query/types/CssTextSegment';
import { findCssCommentEndIndex } from '@/polyfills/media-query/utils/findCssCommentEndIndex';
import { findCssEscapeEndIndex } from '@/polyfills/media-query/utils/findCssEscapeEndIndex';
import { findCssStringEndIndex } from '@/polyfills/media-query/utils/findCssStringEndIndex';

const COMMENT_START = '/*';

const COMMENT_REPLACEMENT = ' ';

const CSS_QUOTE_CHARACTERS = new Set(['"', "'"]);

type ReadCssTextSegmentInput = {
  cssText: string;
  startIndex: number;
};

export const readCssTextSegment = ({
  cssText,
  startIndex,
}: ReadCssTextSegmentInput): CssTextSegment => {
  const character = cssText[startIndex];

  if (cssText.startsWith(COMMENT_START, startIndex)) {
    return {
      text: COMMENT_REPLACEMENT,
      endIndex: findCssCommentEndIndex({
        cssText,
        commentStartIndex: startIndex,
      }),
      isPlainCharacter: false,
    };
  }

  if (character === CSS_ESCAPE_CHARACTER) {
    const escapeEndIndex = findCssEscapeEndIndex({
      cssText,
      escapeStartIndex: startIndex,
    });

    return {
      text: cssText.slice(startIndex, escapeEndIndex),
      endIndex: escapeEndIndex,
      isPlainCharacter: false,
    };
  }

  if (CSS_QUOTE_CHARACTERS.has(character)) {
    const stringEndIndex = findCssStringEndIndex({
      cssText,
      stringStartIndex: startIndex,
    });

    return {
      text: cssText.slice(startIndex, stringEndIndex),
      endIndex: stringEndIndex,
      isPlainCharacter: false,
    };
  }

  return { text: character, endIndex: startIndex + 1, isPlainCharacter: true };
};
