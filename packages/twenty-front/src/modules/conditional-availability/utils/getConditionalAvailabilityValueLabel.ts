import { type ConditionalAvailabilityVisibilityStatus } from '@/conditional-availability/types/ConditionalAvailabilityVisibilityStatus';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityValueLabel = ({
  visibilityStatus,
}: {
  visibilityStatus: ConditionalAvailabilityVisibilityStatus;
}): string => {
  switch (visibilityStatus) {
    case 'everyone':
      return t`Everyone`;
    case 'customRule':
      return t`Custom rule`;
    case 'incompleteRule':
      return t`Incomplete rule`;
    default:
      return assertUnreachable(visibilityStatus);
  }
};
