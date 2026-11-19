import { type ConditionalAvailabilityVisibilityStatus } from '@/conditional-availability/types/ConditionalAvailabilityVisibilityStatus';
import { assertUnreachable } from 'twenty-shared/utils';
import { IconEye, IconEyeX, type IconComponent } from 'twenty-ui/icon';

export const getConditionalAvailabilityValueIcon = ({
  visibilityStatus,
}: {
  visibilityStatus: ConditionalAvailabilityVisibilityStatus;
}): IconComponent => {
  switch (visibilityStatus) {
    case 'everyone':
      return IconEye;
    case 'customRule':
    case 'incompleteRule':
      return IconEyeX;
    default:
      return assertUnreachable(visibilityStatus);
  }
};
