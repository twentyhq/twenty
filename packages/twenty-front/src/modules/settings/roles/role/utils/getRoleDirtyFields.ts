import { hasSameFieldRestrictions } from '@/settings/roles/role/utils/hasSameFieldRestrictions';
import { getRoleWithoutSaveArtifacts } from '@/settings/roles/role/utils/getRoleWithoutSaveArtifacts';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getRoleDirtyFields = (
  draftRole: RoleWithPartialMembers,
  persistedRole: RoleWithPartialMembers | undefined,
): Partial<RoleWithPartialMembers> => {
  const dirtyFields = getDirtyFields(
    getRoleWithoutSaveArtifacts(draftRole),
    isDefined(persistedRole)
      ? getRoleWithoutSaveArtifacts(persistedRole)
      : undefined,
  );

  if (!isDefined(persistedRole)) {
    return dirtyFields;
  }

  const hasSamePermissionFlags = isDeeplyEqual(
    draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
  );
  const hasUnchangedFieldRestrictions = hasSameFieldRestrictions({
    firstRole: draftRole,
    secondRole: persistedRole,
  });

  return Object.fromEntries(
    Object.entries(dirtyFields).filter(
      ([key]) =>
        !(key === 'permissionFlags' && hasSamePermissionFlags) &&
        !(key === 'fieldPermissions' && hasUnchangedFieldRestrictions),
    ),
  );
};
