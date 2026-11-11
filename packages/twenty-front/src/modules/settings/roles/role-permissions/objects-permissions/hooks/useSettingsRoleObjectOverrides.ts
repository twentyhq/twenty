import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsRoleExpandedObjectOverrideIdsFamilyState } from '@/settings/roles/states/settingsRoleExpandedObjectOverrideIdsFamilyState';
import { settingsRoleListedObjectOverrideIdsFamilyState } from '@/settings/roles/states/settingsRoleListedObjectOverrideIdsFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { isDefined } from 'twenty-shared/utils';

export const useSettingsRoleObjectOverrides = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsRoleListedObjectOverrideIds = useSetAtomFamilyState(
    settingsRoleListedObjectOverrideIdsFamilyState,
    roleId,
  );
  const setSettingsRoleExpandedObjectOverrideIds = useSetAtomFamilyState(
    settingsRoleExpandedObjectOverrideIdsFamilyState,
    roleId,
  );
  const { resetObjectPermission } = useResetObjectPermission(roleId);

  const addObjectOverride = (objectMetadataId: string) => {
    setSettingsRoleListedObjectOverrideIds((currentIds) => [
      ...currentIds.filter((id) => id !== objectMetadataId),
      objectMetadataId,
    ]);
    setSettingsRoleExpandedObjectOverrideIds((currentIds) => [
      ...currentIds.filter((id) => id !== objectMetadataId),
      objectMetadataId,
    ]);
  };

  const toggleObjectOverrideExpanded = (objectMetadataId: string) => {
    setSettingsRoleListedObjectOverrideIds((currentIds) =>
      currentIds.includes(objectMetadataId)
        ? currentIds
        : [...currentIds, objectMetadataId],
    );
    setSettingsRoleExpandedObjectOverrideIds((currentIds) =>
      currentIds.includes(objectMetadataId)
        ? currentIds.filter((id) => id !== objectMetadataId)
        : [...currentIds, objectMetadataId],
    );
  };

  const removeObjectOverride = (objectMetadataId: string) => {
    resetObjectPermission(objectMetadataId);
    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      rowLevelPermissionPredicates:
        currentSettingsDraftRole.rowLevelPermissionPredicates?.filter(
          (predicate) =>
            predicate.objectMetadataId !== objectMetadataId ||
            isDefined(predicate.relationFieldMetadataId),
        ),
      rowLevelPermissionPredicateGroups:
        currentSettingsDraftRole.rowLevelPermissionPredicateGroups?.filter(
          (predicateGroup) =>
            predicateGroup.objectMetadataId !== objectMetadataId,
        ),
    }));
    setSettingsRoleListedObjectOverrideIds((currentIds) =>
      currentIds.filter((id) => id !== objectMetadataId),
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
