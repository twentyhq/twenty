import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { getRoleWithRuleOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithRuleOperations';
import { getRoleWithoutRowLevelPermissionRules } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithoutRowLevelPermissionRules';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { v4 } from 'uuid';

export const useRowLevelPermissionRulesInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const createRule = (objectMetadataId: string) => {
    const rowLevelPermissionRuleId = v4();

    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      rowLevelPermissionRules: [
        ...(currentSettingsDraftRole.rowLevelPermissionRules ?? []),
        {
          __typename: 'RowLevelPermissionRule',
          id: rowLevelPermissionRuleId,
          objectMetadataId,
          canReadRecords: true,
          canCreateRecords: false,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
        },
      ],
    }));

    return rowLevelPermissionRuleId;
  };

  const setRuleOperations = ({
    rowLevelPermissionRuleId,
    operations,
  }: {
    rowLevelPermissionRuleId: string;
    operations: SettingsRoleObjectPermissionKey[];
  }) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithRuleOperations({
        role: currentSettingsDraftRole,
        rowLevelPermissionRuleId,
        operations,
      }),
    );
  };

  const deleteRule = (rowLevelPermissionRuleId: string) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithoutRowLevelPermissionRules({
        role: currentSettingsDraftRole,
        shouldRemoveRule: (rule) => rule.id === rowLevelPermissionRuleId,
      }),
    );
  };

  return { createRule, setRuleOperations, deleteRule };
};
