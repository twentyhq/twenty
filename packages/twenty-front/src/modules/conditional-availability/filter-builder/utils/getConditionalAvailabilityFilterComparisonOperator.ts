import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { type ExpressionComparisonOperator } from 'twenty-shared/expression';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterComparisonOperator = ({
  operator,
}: {
  operator: ConditionalAvailabilityFilterOperator;
}): ExpressionComparisonOperator => {
  switch (operator) {
    case 'is':
    case 'isAnyOf':
      return 'EQUAL';
    case 'isNot':
    case 'isNoneOf':
      return 'NOT_EQUAL';
    case 'greaterThanOrEqual':
      return 'GREATER_THAN_OR_EQUAL';
    case 'lessThanOrEqual':
      return 'LESS_THAN_OR_EQUAL';
    default:
      return assertUnreachable(operator);
  }
};
