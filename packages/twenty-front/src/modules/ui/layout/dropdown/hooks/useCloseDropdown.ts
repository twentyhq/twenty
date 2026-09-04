import { useCallback } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';

import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useWorkspaceSurfaceScopedComponentInstanceIdResolver } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useCloseDropdown = () => {
  const surfaceId = useComponentStateSurfaceId();
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();
  const resolveComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceIdResolver();

  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const closeDropdown = useCallback(
    (dropdownComponentInstanceIdFromProps?: string) => {
      const rawDropdownComponentInstanceId =
        dropdownComponentInstanceIdFromProps ??
        dropdownComponentInstanceIdFromContext;

      if (!isDefined(rawDropdownComponentInstanceId)) {
        throw new Error('Dropdown component instance ID is not defined');
      }

      const dropdownComponentInstanceId = resolveComponentInstanceId(
        rawDropdownComponentInstanceId,
      );

      const isDropdownOpen = store.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: dropdownComponentInstanceId,
          surfaceId,
        }),
      );

      if (isDropdownOpen) {
        removeFocusItemFromFocusStackById({
          focusId: dropdownComponentInstanceId,
        });

        goBackToPreviousDropdownFocusId();

        store.set(
          isDropdownOpenComponentState.atomFamily({
            instanceId: dropdownComponentInstanceId,
            surfaceId,
          }),
          false,
        );
      }
    },
    [
      removeFocusItemFromFocusStackById,
      goBackToPreviousDropdownFocusId,
      dropdownComponentInstanceIdFromContext,
      resolveComponentInstanceId,
      store,
      surfaceId,
    ],
  );

  return {
    closeDropdown,
  };
};
