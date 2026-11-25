import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';
import { isNonEmptyString } from '@sniptt/guards';
import { CONDITIONAL_AVAILABILITY_DEVICES } from 'twenty-shared/conditional-availability';
import { assertUnreachable } from 'twenty-shared/utils';

export const isConditionalAvailabilityFilterValueValid = ({
  variable,
  value,
}: {
  variable: ConditionalAvailabilityFilterVariable;
  value: string;
}): boolean => {
  switch (variable) {
    case 'currentRole':
    case 'currentWorkspaceMember':
      return isNonEmptyString(value);
    case 'device':
      return CONDITIONAL_AVAILABILITY_DEVICES.some(
        (device) => device === value,
      );
    default:
      return assertUnreachable(variable);
  }
};
