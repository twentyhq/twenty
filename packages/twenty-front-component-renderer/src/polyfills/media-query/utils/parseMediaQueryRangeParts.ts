import { isNonEmptyString } from '@sniptt/guards';

import { type MediaQueryRangeParts } from '@/polyfills/media-query/types/MediaQueryRangeParts';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

// Splitting on the operators keeps this linear. Matching operands with a lazy
// `.+?` instead backtracks cubically whenever the condition holds a character
// `.` cannot cross, such as the U+2028 line separator CSS whitespace keeps.
const RANGE_OPERATOR_SPLIT_PATTERN = /(<=|>=|<|>|=)/;

const ONE_OPERATOR_PART_COUNT = 3;

const TWO_OPERATOR_PART_COUNT = 5;

export const parseMediaQueryRangeParts = (
  conditionContent: string,
): MediaQueryRangeParts | null => {
  const splitParts = conditionContent.split(RANGE_OPERATOR_SPLIT_PATTERN);

  if (
    splitParts.length !== ONE_OPERATOR_PART_COUNT &&
    splitParts.length !== TWO_OPERATOR_PART_COUNT
  ) {
    return null;
  }

  const operands = splitParts
    .filter((_, partIndex) => partIndex % 2 === 0)
    .map(trimCssWhitespace);

  if (!operands.every(isNonEmptyString)) {
    return null;
  }

  return {
    operands,
    operators: splitParts.filter((_, partIndex) => partIndex % 2 === 1),
  };
};
