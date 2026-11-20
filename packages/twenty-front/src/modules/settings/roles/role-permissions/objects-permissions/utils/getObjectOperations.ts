import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getRecordsGrantOperations';
import { resolveSettingsRoleObjectRecordsGrant } from '@/settings/roles/role/utils/resolveSettingsRoleObjectRecordsGrant';

export const getObjectOperations = (
  parameters: Parameters<typeof resolveSettingsRoleObjectRecordsGrant>[0],
): SettingsRoleObjectPermissionKey[] =>
  getRecordsGrantOperations(resolveSettingsRoleObjectRecordsGrant(parameters));
