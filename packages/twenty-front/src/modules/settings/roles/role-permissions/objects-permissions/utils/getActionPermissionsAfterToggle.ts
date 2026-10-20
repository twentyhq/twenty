import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';

// The server rejects a writing permission on an object the role cannot read
export const getActionPermissionsAfterToggle = ({
  actionPermissions,
  permissionKey,
  value,
}: {
  actionPermissions: SettingsRoleObjectActionPermissions;
  permissionKey: SettingsRoleObjectPermissionKey;
  value: boolean;
}): SettingsRoleObjectActionPermissions => {
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
