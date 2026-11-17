import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';

export const getObjectPermissionFromOperations = (
  operations: SettingsRoleObjectPermissionKey[],
): Record<SettingsRoleObjectPermissionKey, boolean> => ({
  canReadObjectRecords: operations.includes('canReadObjectRecords'),
  canUpdateObjectRecords: operations.includes('canUpdateObjectRecords'),
  canSoftDeleteObjectRecords: operations.includes('canSoftDeleteObjectRecords'),
  canDestroyObjectRecords: operations.includes('canDestroyObjectRecords'),
});
