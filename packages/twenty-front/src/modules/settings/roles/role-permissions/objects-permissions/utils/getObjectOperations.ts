import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { resolveSettingsRoleObjectRecordsGrant } from '@/settings/roles/role/utils/resolveSettingsRoleObjectRecordsGrant';

export const getObjectOperations = (
  parameters: Parameters<typeof resolveSettingsRoleObjectRecordsGrant>[0],
): SettingsRoleObjectPermissionKey[] => {
  const {
    canReadRecords,
    canUpdateRecords,
    canSoftDeleteRecords,
    canDestroyRecords,
  } = resolveSettingsRoleObjectRecordsGrant(parameters);
  const isOperationAllowed: Record<SettingsRoleObjectPermissionKey, boolean> = {
    canReadObjectRecords: canReadRecords,
    canUpdateObjectRecords: canUpdateRecords,
    canSoftDeleteObjectRecords: canSoftDeleteRecords,
    canDestroyObjectRecords: canDestroyRecords,
  };

  return SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (operation) => isOperationAllowed[operation],
  );
};
