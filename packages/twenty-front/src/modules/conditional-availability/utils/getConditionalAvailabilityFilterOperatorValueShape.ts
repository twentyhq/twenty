import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalAvailabilityFilterValueShape } from '@/conditional-availability/types/ConditionalAvailabilityFilterValueShape';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterOperatorValueShape = ({
  operator,
}: {
  operator: ConditionalAvailabilityFilterOperator;
}): ConditionalAvailabilityFilterValueShape => {
  switch (operator) {
    case 'is':
    case 'isNot':
      return 'single';
    case 'isAnyOf':
    case 'isNoneOf':
      return 'list';
    default:
      return assertUnreachable(operator);
  }
};
