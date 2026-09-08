import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { createMediaQueryNumericCondition } from '@/polyfills/media-query/utils/createMediaQueryNumericCondition';
import { isMediaQueryRangeOperator } from '@/polyfills/media-query/utils/isMediaQueryRangeOperator';
import { parseMediaQueryBareNumericFeature } from '@/polyfills/media-query/utils/parseMediaQueryBareNumericFeature';
import { parseMediaQueryRangeParts } from '@/polyfills/media-query/utils/parseMediaQueryRangeParts';

const FLIPPED_COMPARISON_OPERATORS: Record<
  MediaQueryComparisonOperator,
  MediaQueryComparisonOperator
> = {
  '<': '>',
  '<=': '>=',
  '>': '<',
  '>=': '<=',
  '=': '=',
};

const isLessThanOperator = (operator: MediaQueryComparisonOperator): boolean =>
  operator === '<' || operator === '<=';

export const parseMediaQueryRangeCondition = (
  conditionContent: string,
): ParsedMediaQueryCondition[] | null => {
  const rangeParts = parseMediaQueryRangeParts(conditionContent);

  if (!isDefined(rangeParts)) {
    return null;
  }

  const [leftOperand, middleOperand, rightOperand] = rangeParts.operands;
  const [firstOperator, secondOperator] = rangeParts.operators;

  if (!isMediaQueryRangeOperator(firstOperator)) {
    return null;
  }

  const leftFeature = parseMediaQueryBareNumericFeature(leftOperand);

  if (isDefined(leftFeature)) {
    if (isDefined(secondOperator)) {
      return null;
    }

    const condition = createMediaQueryNumericCondition({
      feature: leftFeature,
      operator: firstOperator,
      valueString: middleOperand,
    });

    return isDefined(condition) ? [condition] : null;
  }

  const middleFeature = parseMediaQueryBareNumericFeature(middleOperand);

  if (!isDefined(middleFeature)) {
    return null;
  }

  const firstCondition = createMediaQueryNumericCondition({
    feature: middleFeature,
    operator: FLIPPED_COMPARISON_OPERATORS[firstOperator],
    valueString: leftOperand,
  });

  if (!isDefined(firstCondition)) {
    return null;
  }

  if (!isDefined(secondOperator)) {
    return [firstCondition];
  }

  if (
    firstOperator === '=' ||
    !isMediaQueryRangeOperator(secondOperator) ||
    secondOperator === '=' ||
    isLessThanOperator(firstOperator) !== isLessThanOperator(secondOperator)
  ) {
    return null;
  }

  const secondCondition = createMediaQueryNumericCondition({
    feature: middleFeature,
    operator: secondOperator,
    valueString: rightOperand,
  });

  return isDefined(secondCondition) ? [firstCondition, secondCondition] : null;
};
