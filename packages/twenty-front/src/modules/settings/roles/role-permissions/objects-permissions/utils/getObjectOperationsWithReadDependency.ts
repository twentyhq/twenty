import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';

export const getObjectOperationsWithReadDependency = ({
  previousOperations,
  nextOperations,
}: {
  previousOperations: SettingsRoleObjectPermissionKey[];
  nextOperations: SettingsRoleObjectPermissionKey[];
}): SettingsRoleObjectPermissionKey[] => {
  const hadReadOperation = previousOperations.includes('canReadObjectRecords');
  const hasReadOperation = nextOperations.includes('canReadObjectRecords');

  if (hadReadOperation && !hasReadOperation) {
    return [];
  }

  const hasChange = nextOperations.some(
    (key) => key !== 'canReadObjectRecords',
  );

  return SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (key) =>
      nextOperations.includes(key) ||
      (key === 'canReadObjectRecords' && hasChange),
  );
};
