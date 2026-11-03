import { isDefined } from 'twenty-shared/utils';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const applyCoreAgentPermissionIntent = ({
  draftRole,
  baseRole,
  assignedRole,
  submittedRole,
}: {
  draftRole: RoleWithPartialMembers;
  baseRole: RoleWithPartialMembers | undefined;
  assignedRole: RoleWithPartialMembers;
  submittedRole?: RoleWithPartialMembers;
}) => {
  const dirtyFields = {
    ...getRoleDirtyFields({ draftRole, persistedRole: baseRole }),
    ...(isDefined(submittedRole)
      ? getRoleDirtyFields({ draftRole, persistedRole: submittedRole })
      : {}),
  };
  const nextRole = { ...assignedRole };
  const applyField = <TField extends keyof RoleWithPartialMembers>(
    field: TField,
  ) => {
    if (field in dirtyFields) {
      nextRole[field] = draftRole[field];
    }
  };

  for (const field of [
    'canReadAllObjectRecords',
    'canUpdateAllObjectRecords',
    'canSoftDeleteAllObjectRecords',
    'canDestroyAllObjectRecords',
    'canUpdateAllSettings',
    'canAccessAllTools',
    'canAccessAllAgentChatChannels',
    'permissionFlags',
    'objectPermissions',
    'fieldPermissions',
    'rowLevelPermissionPredicates',
    'rowLevelPermissionPredicateGroups',
  ] as const) {
    applyField(field);
  }

  return nextRole;
};
