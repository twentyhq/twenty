import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { getRoleWithObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithObjectOperations';
import { getRoleWithoutObjectOverride } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithoutObjectOverride';
import { getObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectDisabledOperations';
import { getObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperations';
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

  const addObjectOverride = (
    objectMetadataItem: Pick<
      EnrichedObjectMetadataItem,
      'id' | 'disabledObjectPermissionActions'
    >,
  ) => {
    const objectMetadataId = objectMetadataItem.id;
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithObjectOperations({
        role: currentSettingsDraftRole,
        objectMetadataId,
        operations: getObjectOperations({
          role: currentSettingsDraftRole,
          objectMetadataId,
          disabledOperations: getObjectDisabledOperations(objectMetadataItem),
        }),
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
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithoutObjectOverride({
        role: currentSettingsDraftRole,
        objectMetadataId,
      }),
    );
    setSettingsRoleExpandedObjectOverrideIds((currentIds) =>
      currentIds.filter((id) => id !== objectMetadataId),
    );
  };

  const setObjectOperations = ({
    objectMetadataId,
    operations,
  }: {
    objectMetadataId: string;
    operations: SettingsRoleObjectPermissionKey[];
  }) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithObjectOperations({
        role: currentSettingsDraftRole,
        objectMetadataId,
        operations,
      }),
    );
  };

  return {
    addObjectOverride,
    setObjectOperations,
    toggleObjectOverrideExpanded,
    removeObjectOverride,
  };
};
