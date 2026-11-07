import { isDefined } from 'twenty-shared/utils';

import { resolveCssCalcExpressionInPixels } from '@/host/scroll/utils/resolveCssCalcExpressionInPixels';

const CALC_FUNCTION_PATTERN = /^calc\((.*)\)$/is;

export const resolveScrollLengthInPixels = ({
  length,
  referenceSize,
}: {
  length: string;
  referenceSize: number;
}): number => {
  const trimmedLength = length.trim();
  const calcExpression = CALC_FUNCTION_PATTERN.exec(trimmedLength)?.[1];

  if (isDefined(calcExpression)) {
    return resolveCssCalcExpressionInPixels({
      expression: calcExpression,
      referenceSize,
    });
  }

  const numericLength = Number.parseFloat(trimmedLength);

  if (!Number.isFinite(numericLength)) {
    return 0;
  }

  return trimmedLength.endsWith('%')
    ? (numericLength * referenceSize) / 100
    : numericLength;
};
