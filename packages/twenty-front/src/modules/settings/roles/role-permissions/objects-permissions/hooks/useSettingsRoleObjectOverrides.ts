import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/utils/getRoleWithUpsertedObjectPermission';
import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { getRoleWithoutObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithoutObjectRowLevelPermissionRules';
import { resolveSettingsRoleObjectRecordsGrant } from '@/settings/roles/role/utils/resolveSettingsRoleObjectRecordsGrant';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsRoleExpandedObjectOverrideIdsFamilyState } from '@/settings/roles/states/settingsRoleExpandedObjectOverrideIdsFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useSettingsRoleObjectOverrides = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsRoleExpandedObjectOverrideIds = useSetAtomFamilyState(
    settingsRoleExpandedObjectOverrideIdsFamilyState,
    roleId,
  );
  const { resetObjectPermission } = useResetObjectPermission(roleId);

  const addObjectOverride = (objectMetadataId: string) => {
    setSettingsDraftRole((currentSettingsDraftRole) => {
      const {
        canReadRecords,
        canUpdateRecords,
        canSoftDeleteRecords,
        canDestroyRecords,
      } = resolveSettingsRoleObjectRecordsGrant({
        role: currentSettingsDraftRole,
        objectMetadataId,
      });

      return getRoleWithUpsertedObjectPermission(currentSettingsDraftRole, {
        objectMetadataId,
        canReadObjectRecords: canReadRecords,
        canUpdateObjectRecords: canUpdateRecords,
        canSoftDeleteObjectRecords: canSoftDeleteRecords,
        canDestroyObjectRecords: canDestroyRecords,
      });
    });
    setSettingsRoleExpandedObjectOverrideIds((currentIds) => [
      ...currentIds.filter((id) => id !== objectMetadataId),
      objectMetadataId,
    ]);
  };

  const toggleObjectOverrideExpanded = (objectMetadataId: string) => {
    setSettingsRoleExpandedObjectOverrideIds((currentIds) =>
      currentIds.includes(objectMetadataId)
        ? currentIds.filter((id) => id !== objectMetadataId)
        : [...currentIds, objectMetadataId],
    );
  };

  const removeObjectOverride = (objectMetadataId: string) => {
    resetObjectPermission(objectMetadataId);
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithoutObjectRowLevelPermissionRules({
        role: currentSettingsDraftRole,
        objectMetadataId,
      }),
    );
    setSettingsRoleExpandedObjectOverrideIds((currentIds) =>
      currentIds.filter((id) => id !== objectMetadataId),
    );
  };

  return {
    addObjectOverride,
    toggleObjectOverrideExpanded,
    removeObjectOverride,
  };
};
