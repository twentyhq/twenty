import { getRolePermissionComparison } from '@/settings/roles/role/utils/getRolePermissionComparison';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getRoleDirtyFields = ({
  draftRole,
  persistedRole,
}: {
  draftRole: RoleWithPartialMembers;
  persistedRole: RoleWithPartialMembers | undefined;
}): Partial<RoleWithPartialMembers> => {
  const dirtyFields = getDirtyFields(draftRole, persistedRole);

  if (!isDefined(persistedRole)) {
    return dirtyFields;
  }

  const draftPermissions = getRolePermissionComparison(draftRole);
  const persistedPermissions = getRolePermissionComparison(persistedRole);

  for (const field of [
    'permissionFlags',
    'objectPermissions',
    'fieldPermissions',
    'rowLevelPermissionPredicates',
    'rowLevelPermissionPredicateGroups',
  ] as const) {
    if (isDeeplyEqual(draftPermissions[field], persistedPermissions[field])) {
      delete dirtyFields[field];
    }
  }

  return dirtyFields;
};
