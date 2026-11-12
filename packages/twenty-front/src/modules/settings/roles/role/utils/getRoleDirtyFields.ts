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

  const isSameByKey: Record<string, boolean> = {
    rowLevelPermissionRules: true,
    permissionFlags: isDeeplyEqual(
      draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
      persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    ),
    objectPermissions: isDeeplyEqual(
      resolveSettingsRoleObjectPermissions(draftRole),
      resolveSettingsRoleObjectPermissions(persistedRole),
    ),
    fieldPermissions:
      isDeeplyEqual(
        getUnreadableFieldMetadataIds(draftRole),
        getUnreadableFieldMetadataIds(persistedRole),
      ) &&
      isDeeplyEqual(
        getUneditableFieldMetadataIds(draftRole),
        getUneditableFieldMetadataIds(persistedRole),
      ),
    rowLevelPermissionPredicates: isDeeplyEqual(
      (draftRole.rowLevelPermissionPredicates ?? []).toSorted(
        sortByProperty('id'),
      ),
      (persistedRole.rowLevelPermissionPredicates ?? []).toSorted(
        sortByProperty('id'),
      ),
    ),
    rowLevelPermissionPredicateGroups: isDeeplyEqual(
      (draftRole.rowLevelPermissionPredicateGroups ?? []).toSorted(
        sortByProperty('id'),
      ),
      (persistedRole.rowLevelPermissionPredicateGroups ?? []).toSorted(
        sortByProperty('id'),
      ),
    ),
  };

  return Object.fromEntries(
    Object.entries(dirtyFields).filter(([key]) => isSameByKey[key] !== true),
  );
};
