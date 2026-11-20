import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRecordsGrantOperations';
import { getObjectRecordsGrant } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectRecordsGrant';

export const getObjectOperations = (
  parameters: Parameters<typeof getObjectRecordsGrant>[0],
): SettingsRoleObjectPermissionKey[] =>
  getRecordsGrantOperations(getObjectRecordsGrant(parameters));
