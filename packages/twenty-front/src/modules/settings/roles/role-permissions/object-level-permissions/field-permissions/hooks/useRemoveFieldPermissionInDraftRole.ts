import { getRoleWithRemovedFieldPermission } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/getRoleWithRemovedFieldPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/hooks/useRoutedFlowStateScopeId';
import { getRoutedFlowScopedFamilyStateAtom } from '@/ui/utilities/state/jotai/utils/getRoutedFlowScopedFamilyStateAtom';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveFieldPermissionInDraftRole = () => {
  const store = useStore();
  const routedFlowStateScopeId = useRoutedFlowStateScopeId();

  const removeFieldPermissionInDraftRole = useCallback(
    (roleId: string, fieldPermissionFieldMetadataId: string) => {
      const draftRoleAtom = getRoutedFlowScopedFamilyStateAtom(
        settingsDraftRoleFamilyState,
        roleId,
        routedFlowStateScopeId,
      );
      const currentSettingsDraftRole = store.get(draftRoleAtom);

      const newRole = getRoleWithRemovedFieldPermission(
        currentSettingsDraftRole,
        fieldPermissionFieldMetadataId,
      );

      store.set(draftRoleAtom, newRole);
    },
    [routedFlowStateScopeId, store],
  );

  return {
    removeFieldPermissionInDraftRole,
  };
};
