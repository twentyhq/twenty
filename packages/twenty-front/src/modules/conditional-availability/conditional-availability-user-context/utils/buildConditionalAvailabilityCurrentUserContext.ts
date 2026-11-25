import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type ConditionalAvailabilityCurrentUserContext } from '@/conditional-availability/types/ConditionalAvailabilityCurrentUserContext';

export const buildConditionalAvailabilityCurrentUserContext = ({
  featureFlags,
  permissionFlags,
  currentWorkspaceMember,
}: {
  featureFlags: Record<string, boolean>;
  permissionFlags: Record<string, boolean>;
  currentWorkspaceMember: Pick<CurrentWorkspaceMember, 'id' | 'roles'> | null;
}): ConditionalAvailabilityCurrentUserContext => ({
  featureFlags,
  permissionFlags,
  currentRole: {
    universalIdentifier:
      currentWorkspaceMember?.roles?.at(0)?.universalIdentifier ?? null,
  },
  currentWorkspaceMember: { id: currentWorkspaceMember?.id ?? null },
});
