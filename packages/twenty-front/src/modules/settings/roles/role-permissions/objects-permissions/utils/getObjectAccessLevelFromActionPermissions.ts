import { type SettingsRoleObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectAccessLevel';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';

export const getObjectAccessLevelFromActionPermissions = ({
  canReadObjectRecords,
  canUpdateObjectRecords,
  canSoftDeleteObjectRecords,
  canDestroyObjectRecords,
}: SettingsRoleObjectActionPermissions): SettingsRoleObjectAccessLevel => {
  if (
    !canReadObjectRecords &&
    !canUpdateObjectRecords &&
    !canSoftDeleteObjectRecords &&
    !canDestroyObjectRecords
  ) {
    return 'NO_ACCESS';
  }

  if (
    canReadObjectRecords &&
    !canUpdateObjectRecords &&
    !canSoftDeleteObjectRecords &&
    !canDestroyObjectRecords
  ) {
    return 'READ';
  }

  if (
    canReadObjectRecords &&
    canUpdateObjectRecords &&
    !canSoftDeleteObjectRecords &&
    !canDestroyObjectRecords
  ) {
    return 'EDIT';
  }

  if (
    canReadObjectRecords &&
    canUpdateObjectRecords &&
    canSoftDeleteObjectRecords &&
    canDestroyObjectRecords
  ) {
    return 'EVERYTHING';
  }

  return 'ADVANCED';
};
