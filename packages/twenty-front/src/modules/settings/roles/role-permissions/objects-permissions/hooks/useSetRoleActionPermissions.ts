import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useSetRoleActionPermissions = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const setRoleActionPermissions = ({
    canReadObjectRecords,
    canUpdateObjectRecords,
    canSoftDeleteObjectRecords,
    canDestroyObjectRecords,
  }: SettingsRoleObjectActionPermissions) => {
    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      canReadAllObjectRecords: canReadObjectRecords,
      canUpdateAllObjectRecords: canUpdateObjectRecords,
      canSoftDeleteAllObjectRecords: canSoftDeleteObjectRecords,
      canDestroyAllObjectRecords: canDestroyObjectRecords,
    }));
  };

  return { setRoleActionPermissions };
};
