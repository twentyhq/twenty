import { isDefined } from 'twenty-shared/utils';

import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const mergePersistedRoleIntoDraftRole = ({
  draftRole,
  initialDraftRole,
  persistedRole,
}: {
  draftRole: RoleWithPartialMembers;
  initialDraftRole: RoleWithPartialMembers | undefined;
  persistedRole: RoleWithPartialMembers;
}): RoleWithPartialMembers => {
  const isUninitialized = draftRole.id !== persistedRole.id;
  const hasNoUnsavedChanges =
    isDefined(initialDraftRole) && isDeeplyEqual(draftRole, initialDraftRole);

  if (isUninitialized || hasNoUnsavedChanges) {
    return persistedRole;
  }

  return {
    ...draftRole,
    workspaceMembers: persistedRole.workspaceMembers,
    agents: persistedRole.agents,
    apiKeys: persistedRole.apiKeys,
  };
};
