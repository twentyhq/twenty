import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { getRoleWithObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithObjectActionPermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useSetObjectActionPermissions = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const setObjectActionPermissions = ({
    objectMetadataId,
    actionPermissions,
  }: {
    objectMetadataId: string;
    actionPermissions: SettingsRoleObjectActionPermissions;
  }) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithObjectActionPermissions({
        role: currentSettingsDraftRole,
        objectMetadataId,
        actionPermissions,
      }),
    );
  };

  return { setObjectActionPermissions };
};
