import { isDefined } from 'twenty-shared/utils';

import { CSS_WHITESPACE_CHARACTER_CLASS } from '@/polyfills/media-query/constants/CssWhitespaceCharacterClass';
import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { createMediaQueryNumericCondition } from '@/polyfills/media-query/utils/createMediaQueryNumericCondition';
import { isMediaQueryRangeOperator } from '@/polyfills/media-query/utils/isMediaQueryRangeOperator';
import { parseMediaQueryBareNumericFeature } from '@/polyfills/media-query/utils/parseMediaQueryBareNumericFeature';
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

  const leftFeature = parseMediaQueryBareNumericFeature(
    trimCssWhitespace(leftOperand),
  );

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

  const middleFeature = parseMediaQueryBareNumericFeature(
    trimCssWhitespace(middleOperand),
  );

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
