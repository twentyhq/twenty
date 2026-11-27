import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterOperatorLabel = ({
  operator,
}: {
  operator: ConditionalAvailabilityFilterOperator;
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
    case 'greaterThanOrEqual':
      return t`Greater than or equal`;
    case 'lessThanOrEqual':
      return t`Less than or equal`;
    default:
      return assertUnreachable(operator);
  }
};
