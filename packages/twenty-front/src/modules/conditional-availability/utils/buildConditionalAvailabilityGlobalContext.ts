import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalAvailabilityGlobalContext } from 'twenty-shared/types';

type BuildConditionalAvailabilityGlobalContextParams = {
  featureFlags: Record<string, boolean>;
  permissionFlags: Record<string, boolean>;
  currentWorkspaceMember: Pick<CurrentWorkspaceMember, 'id' | 'roles'> | null;
};

export const buildConditionalAvailabilityGlobalContext = ({
  featureFlags,
  permissionFlags,
  currentWorkspaceMember,
}: BuildConditionalAvailabilityGlobalContextParams): ConditionalAvailabilityGlobalContext => {
  const roleUniversalIdentifier =
    currentWorkspaceMember?.roles?.at(0)?.universalIdentifier;
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;

  return {
    featureFlags,
    permissionFlags,
    currentRole: isNonEmptyString(roleUniversalIdentifier)
      ? { universalIdentifier: roleUniversalIdentifier }
      : null,
    currentWorkspaceMember: isNonEmptyString(currentWorkspaceMemberId)
      ? { id: currentWorkspaceMemberId }
      : null,
  };
};
