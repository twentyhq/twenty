import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterVariablePath = ({
  variable,
}: {
  variable: ConditionalAvailabilityFilterVariable;
}): string => {
  switch (variable) {
    case 'currentRole':
      return 'currentRole.universalIdentifier';
    case 'currentWorkspaceMember':
      return 'currentWorkspaceMember.id';
    case 'device':
      return 'device';
    default:
      return assertUnreachable(variable);
  }
};
