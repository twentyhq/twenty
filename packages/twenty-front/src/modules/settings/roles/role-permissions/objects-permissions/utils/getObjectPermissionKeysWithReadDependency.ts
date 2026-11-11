import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';

export const getObjectPermissionKeysWithReadDependency = ({
  previousKeys,
  nextKeys,
}: {
  previousKeys: SettingsRoleObjectPermissionKey[];
  nextKeys: SettingsRoleObjectPermissionKey[];
}): SettingsRoleObjectPermissionKey[] => {
  const hadRead = previousKeys.includes('canReadObjectRecords');
  const hasRead = nextKeys.includes('canReadObjectRecords');

  if (hadRead && !hasRead) {
    return [];
  }

  const hasChange = nextKeys.some((key) => key !== 'canReadObjectRecords');

  return SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (key) =>
      nextKeys.includes(key) || (key === 'canReadObjectRecords' && hasChange),
  );
};
