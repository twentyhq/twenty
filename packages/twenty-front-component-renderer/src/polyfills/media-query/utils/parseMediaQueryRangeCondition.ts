import { isDefined } from 'twenty-shared/utils';

import { CSS_WHITESPACE_CHARACTER_CLASS } from '@/polyfills/media-query/constants/CssWhitespaceCharacterClass';
import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { createMediaQueryRangeCondition } from '@/polyfills/media-query/utils/createMediaQueryRangeCondition';
import { isMediaQueryRangeOperator } from '@/polyfills/media-query/utils/isMediaQueryRangeOperator';
import { parseMediaQueryNumericFeatureName } from '@/polyfills/media-query/utils/parseMediaQueryNumericFeatureName';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

const RANGE_CONDITION_PATTERN = new RegExp(
  `^(.+?)${CSS_WHITESPACE_CHARACTER_CLASS}*(<=|>=|<|>|=)${CSS_WHITESPACE_CHARACTER_CLASS}*(.+?)(?:${CSS_WHITESPACE_CHARACTER_CLASS}*(<=|>=|<|>)${CSS_WHITESPACE_CHARACTER_CLASS}*(.+?))?$`,
);

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
  const rangeMatch = conditionContent.match(RANGE_CONDITION_PATTERN);

  if (!isDefined(rangeMatch)) {
    return null;
  }

  const [
    ,
    leftOperand,
    firstOperator,
    middleOperand,
    secondOperator,
    rightOperand,
  ] = rangeMatch;

  if (!isMediaQueryRangeOperator(firstOperator)) {
    return null;
  }

  const leftFeatureName = parseMediaQueryNumericFeatureName(
    trimCssWhitespace(leftOperand),
  );

  if (isDefined(leftFeatureName)) {
    if (leftFeatureName.operator !== '=' || isDefined(secondOperator)) {
      return null;
    }

    const condition = createMediaQueryRangeCondition({
      feature: leftFeatureName.feature,
      operator: firstOperator,
      valueString: middleOperand,
    });

    return isDefined(condition) ? [condition] : null;
  }

  const middleFeatureName = parseMediaQueryNumericFeatureName(
    trimCssWhitespace(middleOperand),
  );

  if (!isDefined(middleFeatureName) || middleFeatureName.operator !== '=') {
    return null;
  }

  const firstCondition = createMediaQueryRangeCondition({
    feature: middleFeatureName.feature,
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
    isLessThanOperator(firstOperator) !== isLessThanOperator(secondOperator)
  ) {
    return null;
  }

  const secondCondition = createMediaQueryRangeCondition({
    feature: middleFeatureName.feature,
    operator: secondOperator,
    valueString: rightOperand,
  });

  return isDefined(secondCondition) ? [firstCondition, secondCondition] : null;
};
