import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRecordsGrantOperations';
import { getObjectRecordsGrant } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectRecordsGrant';

export const getObjectOperations = ({
  disabledOperations = [],
  ...recordsGrantParameters
}: Parameters<typeof getObjectRecordsGrant>[0] & {
  disabledOperations?: SettingsRoleObjectPermissionKey[];
}): SettingsRoleObjectPermissionKey[] =>
  getRecordsGrantOperations({
    recordsGrant: getObjectRecordsGrant(recordsGrantParameters),
    disabledOperations,
  });
