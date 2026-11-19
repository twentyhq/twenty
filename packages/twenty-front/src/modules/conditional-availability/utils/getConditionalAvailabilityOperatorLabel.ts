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
    case 'contains':
      return t`Contains`;
    case 'doesNotContain':
      return t`Does not contain`;
    case 'atLeast':
      return t`At least`;
    case 'atMost':
      return t`At most`;
    case 'before':
      return t`Before`;
    case 'after':
      return t`After`;
    case 'isInPast':
      return t`Is in the past`;
    case 'isInFuture':
      return t`Is in the future`;
    case 'isEmpty':
      return t`Is empty`;
    case 'isNotEmpty':
      return t`Is not empty`;
    default:
      return assertUnreachable(operator);
  }
};
