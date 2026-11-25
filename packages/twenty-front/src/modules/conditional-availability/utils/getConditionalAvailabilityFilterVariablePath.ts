import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';
import { doNotTranslate } from 'twenty-shared/i18n';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterVariablePath = ({
  variable,
}: {
  variable: ConditionalAvailabilityFilterVariable;
}): string => {
  switch (variable) {
    case 'currentRole':
      return doNotTranslate('currentRole.universalIdentifier');
    case 'currentWorkspaceMember':
      return doNotTranslate('currentWorkspaceMember.id');
    case 'device':
      return doNotTranslate('device');
    default:
      return assertUnreachable(variable);
  }
};
