import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { isNonEmptyString } from '@sniptt/guards';
import { CONDITIONAL_AVAILABILITY_DEVICES } from 'twenty-shared/conditional-availability';
import { assertUnreachable } from 'twenty-shared/utils';

export const isConditionalAvailabilityRowValueValid = ({
  subject,
  value,
}: {
  subject: ConditionalAvailabilitySubject;
  value: string;
}): boolean => {
  switch (subject) {
    case 'role':
    case 'workspaceMember':
      return isNonEmptyString(value);
    case 'device':
      return CONDITIONAL_AVAILABILITY_DEVICES.some(
        (device) => device === value,
      );
    default:
      return assertUnreachable(subject);
  }
};
