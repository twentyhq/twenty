import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getRoleActionPermissions = (
  role: Pick<
    RoleWithPartialMembers,
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >,
): SettingsRoleObjectActionPermissions => ({
  canReadObjectRecords:
    role[
      SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING
        .canReadObjectRecords
    ],
  canUpdateObjectRecords:
    role[
      SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING
        .canUpdateObjectRecords
    ],
  canSoftDeleteObjectRecords:
    role[
      SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING
        .canSoftDeleteObjectRecords
    ],
  canDestroyObjectRecords:
    role[
      SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING
        .canDestroyObjectRecords
    ],
});
