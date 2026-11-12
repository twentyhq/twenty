import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';

export const getObjectPermissionKeysWithReadDependency = ({
  previousKeys,
  nextKeys,
}: {
  previousKeys: SettingsRoleObjectPermissionKey[];
  nextKeys: SettingsRoleObjectPermissionKey[];
}): SettingsRoleObjectPermissionKey[] => {
  const wasReadGranted = previousKeys.includes('canReadObjectRecords');
  const isReadGranted = nextKeys.includes('canReadObjectRecords');

  if (wasReadGranted && !isReadGranted) {
    return [];
  }

  const hasChange = nextKeys.some((key) => key !== 'canReadObjectRecords');

  return SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (key) =>
      nextKeys.includes(key) || (key === 'canReadObjectRecords' && hasChange),
  );
};
