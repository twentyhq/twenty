import { getRoleWithRemovedRecordLevelPermissionRules } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRoleWithRemovedRecordLevelPermissionRules';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useRemoveRecordLevelPermissionRulesInDraftRole = (
  roleId: string,
) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const removeRecordLevelPermissionRulesInDraftRole = (
    objectMetadataId: string,
  ) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithRemovedRecordLevelPermissionRules(
        currentSettingsDraftRole,
        objectMetadataId,
      ),
    );
  };

  return {
    removeRecordLevelPermissionRulesInDraftRole,
  };
};
