import { type ConditionalAvailabilityRowOperator } from '@/conditional-availability/types/ConditionalAvailabilityRowOperator';
import { type ConditionalAvailabilityRowValueShape } from '@/conditional-availability/types/ConditionalAvailabilityRowValueShape';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityRowOperatorValueShape = ({
  operator,
}: {
  operator: ConditionalAvailabilityRowOperator;
}): ConditionalAvailabilityRowValueShape => {
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
