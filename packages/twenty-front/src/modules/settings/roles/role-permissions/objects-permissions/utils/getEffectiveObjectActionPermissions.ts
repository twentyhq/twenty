import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { getRoleActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleActionPermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

export const getEffectiveObjectActionPermissions = (
  role: RoleWithPartialMembers,
  objectMetadataId: string,
): SettingsRoleObjectActionPermissions => {
  const roleActionPermissions = getRoleActionPermissions(role);

  const objectPermission = role.objectPermissions?.find(
    (objectPermissionToFind) =>
      objectPermissionToFind.objectMetadataId === objectMetadataId,
  );

  return SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.reduce(
    (effectivePermissions, permissionKey) => {
      const overrideValue = objectPermission?.[permissionKey];

      effectivePermissions[permissionKey] = isDefined(overrideValue)
        ? overrideValue
        : roleActionPermissions[permissionKey];

      return effectivePermissions;
    },
    { ...roleActionPermissions },
  );
};
