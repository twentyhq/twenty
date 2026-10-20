import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';

// Update, delete and destroy all require read, so toggles cascade both ways.
export const getActionPermissionsAfterToggle = (
  actionPermissions: SettingsRoleObjectActionPermissions,
  permissionKey: SettingsRoleObjectPermissionKey,
  value: boolean,
): SettingsRoleObjectActionPermissions => {
  if (permissionKey === 'canReadObjectRecords' && !value) {
    return {
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    };
  }

  return {
    ...actionPermissions,
    [permissionKey]: value,
    canReadObjectRecords: value || actionPermissions.canReadObjectRecords,
  };
};
