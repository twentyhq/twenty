import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getRoleWithActionPermissions = ({
  role,
  actionPermissions,
}: {
  role: RoleWithPartialMembers;
  actionPermissions: SettingsRoleObjectActionPermissions;
}): RoleWithPartialMembers => ({
  ...role,
  [SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING.canReadObjectRecords]:
    actionPermissions.canReadObjectRecords,
  [SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING.canUpdateObjectRecords]:
    actionPermissions.canUpdateObjectRecords,
  [SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING.canSoftDeleteObjectRecords]:
    actionPermissions.canSoftDeleteObjectRecords,
  [SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING.canDestroyObjectRecords]:
    actionPermissions.canDestroyObjectRecords,
});
