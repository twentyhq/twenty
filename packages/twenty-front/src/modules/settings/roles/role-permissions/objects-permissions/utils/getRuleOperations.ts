import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { type RowLevelPermissionRule } from '~/generated-metadata/graphql';

export const getRuleOperations = (
  rule: Pick<
    RowLevelPermissionRule,
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >,
): SettingsRoleObjectPermissionKey[] => {
  const isOperationAllowed: Record<SettingsRoleObjectPermissionKey, boolean> = {
    canReadObjectRecords: rule.canReadRecords,
    canUpdateObjectRecords: rule.canUpdateRecords,
    canSoftDeleteObjectRecords: rule.canSoftDeleteRecords,
    canDestroyObjectRecords: rule.canDestroyRecords,
  };

  return SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (operation) => isOperationAllowed[operation],
  );
};
