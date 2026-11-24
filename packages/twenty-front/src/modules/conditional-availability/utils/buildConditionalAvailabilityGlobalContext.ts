import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalAvailabilityGlobalContext } from 'twenty-shared/conditional-availability';

export const buildConditionalAvailabilityGlobalContext = ({
  featureFlags,
  permissionFlags,
  currentWorkspaceMember,
}: {
  featureFlags: Record<string, boolean>;
  permissionFlags: Record<string, boolean>;
  currentWorkspaceMember: Pick<CurrentWorkspaceMember, 'id' | 'roles'> | null;
}): ConditionalAvailabilityGlobalContext => {
  const assignedRoleUniversalIdentifier =
    currentWorkspaceMember?.roles?.at(0)?.universalIdentifier;
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;

  return {
    featureFlags,
    permissionFlags,
    currentRole: isNonEmptyString(assignedRoleUniversalIdentifier)
      ? { universalIdentifier: assignedRoleUniversalIdentifier }
      : null,
    currentWorkspaceMember: isNonEmptyString(currentWorkspaceMemberId)
      ? { id: currentWorkspaceMemberId }
      : null,
  };
};
