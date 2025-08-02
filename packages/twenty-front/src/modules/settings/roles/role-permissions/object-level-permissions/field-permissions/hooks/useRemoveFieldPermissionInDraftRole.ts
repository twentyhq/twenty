import { getRoleWithRemovedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithRemovedFieldPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilCallback } from 'recoil';

export const useRemoveFieldPermissionInDraftRole = () => {
  const removeFieldPermissionInDraftRole = useRecoilCallback(
    ({ set, snapshot }) =>
      (roleId: string, fieldPermissionFieldMetadataId: string) => {
        const currentSettingsDraftRole = snapshot
          .getLoadable(settingsDraftRoleFamilyState(roleId))
          .getValue();

        const newRole = getRoleWithRemovedFieldPermission(
          currentSettingsDraftRole,
          fieldPermissionFieldMetadataId,
        );

        set(settingsDraftRoleFamilyState(roleId), newRole);
      },
    [],
  );

  return {
    removeFieldPermissionInDraftRole,
  };
};
