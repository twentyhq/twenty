import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/types/ConditionalAvailabilityFilterOperator';
import { type ExpressionComparisonOperator } from 'twenty-shared/expression';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterComparisonOperator = ({
  operator,
}: {
  operator: ConditionalAvailabilityFilterOperator;
}): Extract<ExpressionComparisonOperator, 'EQUAL' | 'NOT_EQUAL'> => {
  switch (operator) {
    case 'is':
    case 'isAnyOf':
      return 'EQUAL';
    case 'isNot':
    case 'isNoneOf':
      return 'NOT_EQUAL';
    default:
      return assertUnreachable(operator);
  }
};
