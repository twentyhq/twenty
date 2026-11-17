import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/utils/getRoleWithUpsertedObjectPermission';
import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { getObjectOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperations';
import { getObjectPermissionFromOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionFromOperations';
import { getRoleWithoutObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithoutObjectRowLevelPermissionRules';
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
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithUpsertedObjectPermission(currentSettingsDraftRole, {
        objectMetadataId,
        ...getObjectPermissionFromOperations(
          getObjectOperations({
            role: currentSettingsDraftRole,
            objectMetadataId,
          }),
        ),
      }),
    );
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
