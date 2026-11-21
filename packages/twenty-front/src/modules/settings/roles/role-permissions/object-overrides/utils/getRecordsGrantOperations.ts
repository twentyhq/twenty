import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { type RowLevelPermissionRule } from '~/generated-metadata/graphql';

export const getRecordsGrantOperations = ({
  recordsGrant,
  disabledOperations = [],
}: {
  recordsGrant: Pick<
    RowLevelPermissionRule,
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >;
  disabledOperations?: SettingsRoleObjectPermissionKey[];
}): SettingsRoleObjectPermissionKey[] => {
  const isOperationAllowed: Record<SettingsRoleObjectPermissionKey, boolean> = {
    canReadObjectRecords: recordsGrant.canReadRecords,
    canUpdateObjectRecords: recordsGrant.canUpdateRecords,
    canSoftDeleteObjectRecords: recordsGrant.canSoftDeleteRecords,
    canDestroyObjectRecords: recordsGrant.canDestroyRecords,
  };

  return SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (operation) =>
      isOperationAllowed[operation] && !disabledOperations.includes(operation),
  );
};
