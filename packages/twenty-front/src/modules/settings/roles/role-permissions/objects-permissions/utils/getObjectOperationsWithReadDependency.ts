import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';

export const getObjectOperationsWithReadDependency = ({
  previousOperations,
  nextOperations,
}: {
  previousOperations: SettingsRoleObjectPermissionKey[];
  nextOperations: SettingsRoleObjectPermissionKey[];
}): SettingsRoleObjectPermissionKey[] => {
  const hasPreviousReadOperation = previousOperations.includes(
    'canReadObjectRecords',
  );
  const hasNextReadOperation = nextOperations.includes('canReadObjectRecords');

  if (hasPreviousReadOperation && !hasNextReadOperation) {
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
