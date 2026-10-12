import { isNonEmptyArray } from 'twenty-shared/utils';

import { getNextExpectedCssClosingDelimiters } from '@/polyfills/media-query/utils/getNextExpectedCssClosingDelimiters';
import { readCssTextSegment } from '@/polyfills/media-query/utils/readCssTextSegment';

type SplitCssAtTopLevelInput = {
  cssText: string;
  separator: string;
};

export const splitCssAtTopLevel = ({
  cssText,
  separator,
}: SplitCssAtTopLevelInput): string[] => {
  const parts: string[] = [];

  let currentPart = '';
  let expectedClosingDelimiters: string[] = [];
  let characterIndex = 0;

  while (characterIndex < cssText.length) {
    const isAtTopLevel = !isNonEmptyArray(expectedClosingDelimiters);
    const isSeparatorAtTopLevel =
      isAtTopLevel && cssText.startsWith(separator, characterIndex);

    if (isSeparatorAtTopLevel) {
      parts.push(currentPart);
      currentPart = '';
      characterIndex += separator.length;
      continue;
    }

    const segment = readCssTextSegment({
      cssText,
      startIndex: characterIndex,
    });

    currentPart += segment.text;
    characterIndex = segment.endIndex;

    if (segment.isPlainCharacter) {
      expectedClosingDelimiters = getNextExpectedCssClosingDelimiters({
        expectedClosingDelimiters,
        character: segment.text,
      });
    }
  }

  const closingDelimitersOfUnterminatedBlocks = [...expectedClosingDelimiters]
    .reverse()
    .join('');

  parts.push(`${currentPart}${closingDelimitersOfUnterminatedBlocks}`);

  return parts;
};
