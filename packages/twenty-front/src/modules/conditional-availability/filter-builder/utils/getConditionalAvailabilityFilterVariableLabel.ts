import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterVariableLabel = ({
  variable,
}: {
  variable: ConditionalAvailabilityFilterVariable;
}): string => {
  switch (variable) {
    case 'currentRole':
      return t`Role`;
    case 'currentWorkspaceMember':
      return t`Workspace member`;
    case 'device':
      return t`Device`;
    default:
      return assertUnreachable(variable);
  }
};
