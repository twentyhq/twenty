import { isNonEmptyString } from '@sniptt/guards';

import { type MediaQueryRangeParts } from '@/polyfills/media-query/types/MediaQueryRangeParts';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

const RANGE_OPERATOR_SPLIT_PATTERN = /(<=|>=|<|>|=)/;

const ONE_OPERATOR_PART_COUNT = 3;

const TWO_OPERATOR_PART_COUNT = 5;

const isOperandPartIndex = (partIndex: number): boolean => partIndex % 2 === 0;

export const parseMediaQueryRangeParts = (
  conditionContent: string,
): MediaQueryRangeParts | null => {
  const splitParts = conditionContent.split(RANGE_OPERATOR_SPLIT_PATTERN);
  const hasOneOrTwoOperators =
    splitParts.length === ONE_OPERATOR_PART_COUNT ||
    splitParts.length === TWO_OPERATOR_PART_COUNT;

  if (!hasOneOrTwoOperators) {
    return null;
  }

  const operands = splitParts
    .filter((_, partIndex) => isOperandPartIndex(partIndex))
    .map(trimCssWhitespace);

  if (!operands.every(isNonEmptyString)) {
    return null;
  }

  return {
    operands,
    operators: splitParts.filter(
      (_, partIndex) => !isOperandPartIndex(partIndex),
    ),
  };
};
