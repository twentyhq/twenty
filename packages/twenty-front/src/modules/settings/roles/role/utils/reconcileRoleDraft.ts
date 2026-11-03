import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

export const reconcileRoleDraft = ({
  draftRole,
  baseRole,
  persistedRole,
  submittedRole,
}: {
  draftRole: RoleWithPartialMembers;
  baseRole: RoleWithPartialMembers | undefined;
  persistedRole: RoleWithPartialMembers;
  submittedRole?: RoleWithPartialMembers;
}): RoleWithPartialMembers => {
  if (draftRole.id !== persistedRole.id || !isDefined(baseRole)) {
    return persistedRole;
  }

  return {
    ...persistedRole,
    ...getRoleDirtyFields({ draftRole, persistedRole: baseRole }),
    ...(isDefined(submittedRole)
      ? getRoleDirtyFields({ draftRole, persistedRole: submittedRole })
      : {}),
    workspaceMembers: persistedRole.workspaceMembers,
    agents: persistedRole.agents,
    apiKeys: persistedRole.apiKeys,
  };
};
