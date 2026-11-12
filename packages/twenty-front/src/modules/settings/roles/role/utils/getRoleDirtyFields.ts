import { getFieldRestrictionKeys } from '@/settings/roles/role/utils/getFieldRestrictionKeys';
import { getRoleWithoutServerDerivedRuleFields } from '@/settings/roles/role/utils/getRoleWithoutServerDerivedRuleFields';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getRoleDirtyFields = (
  draftRole: RoleWithPartialMembers,
  persistedRole: RoleWithPartialMembers | undefined,
): Partial<RoleWithPartialMembers> => {
  const dirtyFields = getDirtyFields(
    getRoleWithoutServerDerivedRuleFields(draftRole),
    isDefined(persistedRole)
      ? getRoleWithoutServerDerivedRuleFields(persistedRole)
      : undefined,
  );

  if (!isDefined(persistedRole)) {
    return dirtyFields;
  }

  const hasSamePermissionFlags = isDeeplyEqual(
    draftRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
    persistedRole.permissionFlags?.map(({ flag }) => flag).sort() ?? [],
  );
  const hasSameFieldRestrictions = isDeeplyEqual(
    getFieldRestrictionKeys(draftRole),
    getFieldRestrictionKeys(persistedRole),
  );

  return Object.fromEntries(
    Object.entries(dirtyFields).filter(
      ([key]) =>
        !(key === 'permissionFlags' && hasSamePermissionFlags) &&
        !(key === 'fieldPermissions' && hasSameFieldRestrictions),
    ),
  );
};
