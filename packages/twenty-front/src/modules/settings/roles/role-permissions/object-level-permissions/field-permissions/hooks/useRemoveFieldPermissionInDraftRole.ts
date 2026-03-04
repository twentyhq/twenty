import { getRoleWithRemovedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithRemovedFieldPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveFieldPermissionInDraftRole = () => {
  const store = useStore();

  const removeFieldPermissionInDraftRole = useCallback(
    (roleId: string, fieldPermissionFieldMetadataId: string) => {
      const currentSettingsDraftRole = store.get(
        settingsDraftRoleFamilyState.atomFamily(roleId),
      );

      const newRole = getRoleWithRemovedFieldPermission(
        currentSettingsDraftRole,
        fieldPermissionFieldMetadataId,
      );

      store.set(settingsDraftRoleFamilyState.atomFamily(roleId), newRole);
    },
    [store],
  );

  return {
    removeFieldPermissionInDraftRole,
  };
};
