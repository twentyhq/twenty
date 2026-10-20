import { type SettingsRoleObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectAccessLevel';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';

export const getActionPermissionsFromObjectAccessLevel = (
  accessLevel: Exclude<SettingsRoleObjectAccessLevel, 'ADVANCED'>,
): SettingsRoleObjectActionPermissions => {
  switch (accessLevel) {
    case 'NO_ACCESS':
      return {
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      };
    case 'READ':
      return {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      };
    case 'EDIT':
      return {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      };
    case 'EVERYTHING':
      return {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
      };
  }
};
