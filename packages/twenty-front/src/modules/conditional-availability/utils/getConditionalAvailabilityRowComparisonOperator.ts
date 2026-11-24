import { type ConditionalAvailabilityRowOperator } from '@/conditional-availability/types/ConditionalAvailabilityRowOperator';
import { type ConditionalAvailabilityComparisonOperator } from 'twenty-shared/conditional-availability';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityRowComparisonOperator = ({
  operator,
}: {
  operator: ConditionalAvailabilityRowOperator;
}): Extract<
  ConditionalAvailabilityComparisonOperator,
  'EQUAL' | 'NOT_EQUAL'
> => {
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
