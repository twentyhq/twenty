import { isNonEmptyArray } from 'twenty-shared/utils';

import { getNextExpectedCssClosingDelimiters } from '@/polyfills/media-query/utils/getNextExpectedCssClosingDelimiters';
import { readCssTextSegment } from '@/polyfills/media-query/utils/readCssTextSegment';

const OPENING_PARENTHESIS = '(';

export const isParenthesizedCssBlock = (cssText: string): boolean => {
  if (!cssText.startsWith(OPENING_PARENTHESIS)) {
    return false;
  }

  let expectedClosingDelimiters: string[] = [];
  let characterIndex = 0;

  while (characterIndex < cssText.length) {
    const segment = readCssTextSegment({
      cssText,
      startIndex: characterIndex,
    });

    characterIndex = segment.endIndex;

    if (!segment.isPlainCharacter) {
      continue;
    }

    expectedClosingDelimiters = getNextExpectedCssClosingDelimiters({
      expectedClosingDelimiters,
      character: segment.text,
    });

    const isOpeningBlockClosed = !isNonEmptyArray(expectedClosingDelimiters);

    if (isOpeningBlockClosed) {
      return characterIndex === cssText.length;
    }
  }

  return false;
};
