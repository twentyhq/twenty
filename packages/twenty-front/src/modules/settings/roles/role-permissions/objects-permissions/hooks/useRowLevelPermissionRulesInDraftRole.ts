import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { getRoleWithRuleOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithRuleOperations';
import { getRoleWithoutRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithoutRowLevelPermissionRules';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { v4 } from 'uuid';

export const useRowLevelPermissionRulesInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const createRule = (objectMetadataId: string) => {
    const ruleId = v4();

    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      rowLevelPermissionRules: [
        ...(currentSettingsDraftRole.rowLevelPermissionRules ?? []),
        {
          __typename: 'RowLevelPermissionRule',
          id: ruleId,
          objectMetadataId,
          canReadRecords: true,
          canCreateRecords: false,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
        },
      ],
    }));

    return ruleId;
  };

  const setRuleOperations = ({
    ruleId,
    operations,
  }: {
    ruleId: string;
    operations: SettingsRoleObjectPermissionKey[];
  }) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithRuleOperations({
        role: currentSettingsDraftRole,
        ruleId,
        operations,
      }),
    );
  };

  const deleteRule = (ruleId: string) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithoutRowLevelPermissionRules({
        role: currentSettingsDraftRole,
        shouldRemoveRule: (rule) => rule.id === ruleId,
      }),
    );
  };

  return { createRule, setRuleOperations, deleteRule };
};
