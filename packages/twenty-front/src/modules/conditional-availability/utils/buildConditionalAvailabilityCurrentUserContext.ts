import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalAvailabilityCurrentUserContext } from 'twenty-shared/conditional-availability';

export const buildConditionalAvailabilityCurrentUserContext = ({
  featureFlags,
  permissionFlags,
  currentWorkspaceMember,
}: {
  featureFlags: Record<string, boolean>;
  permissionFlags: Record<string, boolean>;
  currentWorkspaceMember: Pick<CurrentWorkspaceMember, 'id' | 'roles'> | null;
}): ConditionalAvailabilityCurrentUserContext => {
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
