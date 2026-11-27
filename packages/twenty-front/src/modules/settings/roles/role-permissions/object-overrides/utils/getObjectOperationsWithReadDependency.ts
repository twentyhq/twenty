import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';

export const getObjectOperationsWithReadDependency = ({
  previousOperations,
  nextOperations,
  disabledOperations = [],
}: {
  previousOperations: SettingsRoleObjectPermissionKey[];
  nextOperations: SettingsRoleObjectPermissionKey[];
  disabledOperations?: SettingsRoleObjectPermissionKey[];
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
      !disabledOperations.includes(key) &&
      (nextOperations.includes(key) ||
        (key === 'canReadObjectRecords' && hasChange)),
  );
};
