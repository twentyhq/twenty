import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getRoleWithRuleOperations = ({
  role,
  rowLevelPermissionRuleId,
  operations,
}: {
  role: RoleWithPartialMembers;
  rowLevelPermissionRuleId: string;
  operations: SettingsRoleObjectPermissionKey[];
}): RoleWithPartialMembers => ({
  ...role,
  rowLevelPermissionRules: (role.rowLevelPermissionRules ?? []).map((rule) => {
    if (rule.id !== rowLevelPermissionRuleId) {
      return rule;
    }

    const canUpdateRecords = operations.includes('canUpdateObjectRecords');

    return {
      ...rule,
      canReadRecords: operations.includes('canReadObjectRecords'),
      canCreateRecords:
        canUpdateRecords === rule.canUpdateRecords
          ? rule.canCreateRecords
          : canUpdateRecords,
      canUpdateRecords,
      canSoftDeleteRecords: operations.includes('canSoftDeleteObjectRecords'),
      canDestroyRecords: operations.includes('canDestroyObjectRecords'),
    };
  }),
});
