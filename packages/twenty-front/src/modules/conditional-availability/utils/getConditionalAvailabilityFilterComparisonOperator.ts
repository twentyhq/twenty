import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalEvaluationComparisonOperator } from 'twenty-shared/conditional-evaluation';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterComparisonOperator = ({
  operator,
}: {
  operator: ConditionalAvailabilityFilterOperator;
}): Extract<ConditionalEvaluationComparisonOperator, 'EQUAL' | 'NOT_EQUAL'> => {
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
