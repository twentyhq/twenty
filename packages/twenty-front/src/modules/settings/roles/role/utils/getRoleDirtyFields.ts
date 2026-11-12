import { getUneditableFieldMetadataIds } from '@/settings/roles/role/utils/getUneditableFieldMetadataIds';
import { getUnreadableFieldMetadataIds } from '@/settings/roles/role/utils/getUnreadableFieldMetadataIds';
import { resolveSettingsRoleObjectPermissions } from '@/settings/roles/role/utils/resolveSettingsRoleObjectPermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getRoleDirtyFields = (
  draftRole: RoleWithPartialMembers,
  persistedRole: RoleWithPartialMembers | undefined,
): Partial<RoleWithPartialMembers> => {
  const dirtyFields = getDirtyFields(draftRole, persistedRole);

  if (!isDefined(persistedRole)) {
    return dirtyFields;
  }

  const hasSamePermissionFlags = isDeeplyEqual(
    draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
  );
  const hasSameUnreadableFields = isDeeplyEqual(
    getUnreadableFieldMetadataIds(draftRole),
    getUnreadableFieldMetadataIds(persistedRole),
  );
  const hasSameUneditableFields = isDeeplyEqual(
    getUneditableFieldMetadataIds(draftRole),
    getUneditableFieldMetadataIds(persistedRole),
  );
  const hasSameRowLevelPermissionPredicates = isDeeplyEqual(
    (draftRole.rowLevelPermissionPredicates ?? []).toSorted(
      sortByProperty('id'),
    ),
    (persistedRole.rowLevelPermissionPredicates ?? []).toSorted(
      sortByProperty('id'),
    ),
  );
  const hasSameRowLevelPermissionPredicateGroups = isDeeplyEqual(
    (draftRole.rowLevelPermissionPredicateGroups ?? []).toSorted(
      sortByProperty('id'),
    ),
    (persistedRole.rowLevelPermissionPredicateGroups ?? []).toSorted(
      sortByProperty('id'),
    ),
  );
  const hasSameObjectPermissions = isDeeplyEqual(
    resolveSettingsRoleObjectPermissions(draftRole),
    resolveSettingsRoleObjectPermissions(persistedRole),
  );

  return Object.fromEntries(
    Object.entries(dirtyFields).filter(
      ([key]) =>
        key !== 'rowLevelPermissionRules' &&
        !(key === 'permissionFlags' && hasSamePermissionFlags) &&
        !(key === 'objectPermissions' && hasSameObjectPermissions) &&
        !(
          key === 'rowLevelPermissionPredicates' &&
          hasSameRowLevelPermissionPredicates
        ) &&
        !(
          key === 'rowLevelPermissionPredicateGroups' &&
          hasSameRowLevelPermissionPredicateGroups
        ) &&
        !(
          key === 'fieldPermissions' &&
          hasSameUnreadableFields &&
          hasSameUneditableFields
        ),
    ),
  );
};
