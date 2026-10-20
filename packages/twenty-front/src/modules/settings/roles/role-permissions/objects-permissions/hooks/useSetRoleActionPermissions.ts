import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { getRoleWithActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithActionPermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useSetRoleActionPermissions = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const setRoleActionPermissions = (
    actionPermissions: SettingsRoleObjectActionPermissions,
  ) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithActionPermissions({
        role: currentSettingsDraftRole,
        actionPermissions,
      }),
    );
  };

  return { setRoleActionPermissions };
};
