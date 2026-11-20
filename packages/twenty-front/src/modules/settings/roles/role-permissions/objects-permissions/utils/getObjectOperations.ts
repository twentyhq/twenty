import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getRecordsGrantOperations';
import { getObjectRecordsGrant } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRecordsGrant';

export const getObjectOperations = (
  parameters: Parameters<typeof getObjectRecordsGrant>[0],
): SettingsRoleObjectPermissionKey[] =>
  getRecordsGrantOperations(getObjectRecordsGrant(parameters));
