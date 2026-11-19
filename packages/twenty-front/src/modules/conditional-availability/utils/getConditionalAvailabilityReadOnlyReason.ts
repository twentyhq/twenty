import { CONDITIONAL_AVAILABILITY_VARIABLE_ROOTS } from '@/conditional-availability/constants/ConditionalAvailabilityVariableRoots';
import { type ConditionalAvailabilityReadOnlyReason } from '@/conditional-availability/types/ConditionalAvailabilityReadOnlyReason';
import { getConditionalAvailabilityNodeVariableRoots } from '@/conditional-availability/utils/getConditionalAvailabilityNodeVariableRoots';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export const getConditionalAvailabilityReadOnlyReason = ({
  node,
  hasRolesPermission,
}: {
  node: ConditionalAvailabilityNode | null;
  hasRolesPermission: boolean;
}): ConditionalAvailabilityReadOnlyReason => {
  const variableRoots = getConditionalAvailabilityNodeVariableRoots({ node });

  if (
    variableRoots.includes(CONDITIONAL_AVAILABILITY_VARIABLE_ROOTS.featureFlags)
  ) {
    return { status: 'readOnly', reason: 'featureFlags' };
  }

  if (
    !hasRolesPermission &&
    variableRoots.includes(CONDITIONAL_AVAILABILITY_VARIABLE_ROOTS.role)
  ) {
    return { status: 'readOnly', reason: 'roles' };
  }

  return { status: 'editable' };
};
