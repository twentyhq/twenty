import { getRoleWithRemovedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/getRoleWithRemovedObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetRecoilState } from 'recoil';

export const useRemoveObjectPermissionFromDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const removeObjectPermissionFromDraftRole = (objectMetadataId: string) => {
    setSettingsDraftRole((currentSettingsDraftRole) =>
      getRoleWithRemovedObjectPermission(
        currentSettingsDraftRole,
        objectMetadataId,
      ),
    );
  };

  return {
    removeObjectPermissionFromDraftRole,
  };
};
