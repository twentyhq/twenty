import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/types/ConditionalAvailabilityFilterOperator';
import { assertUnreachable } from 'twenty-shared/utils';

export const canConditionalAvailabilityFilterOperatorHoldSeveralValues = ({
  operator,
}: {
  operator: ConditionalAvailabilityFilterOperator;
}): boolean => {
  switch (operator) {
    case 'is':
    case 'isNot':
      return false;
    case 'isAnyOf':
    case 'isNoneOf':
      return true;
    default:
      return assertUnreachable(operator);
  }
};
