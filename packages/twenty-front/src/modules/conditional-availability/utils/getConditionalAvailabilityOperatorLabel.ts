import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityOperatorLabel = ({
  operator,
}: {
  operator: ConditionalAvailabilityOperator;
}): string => {
  switch (operator) {
    case 'is':
      return t`Is`;
    case 'isNot':
      return t`Is not`;
    case 'isAnyOf':
      return t`Is any of`;
    case 'isNoneOf':
      return t`Is none of`;
    default:
      return assertUnreachable(operator);
  }
};
