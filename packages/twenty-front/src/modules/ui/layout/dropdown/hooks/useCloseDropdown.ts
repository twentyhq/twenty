import { useCallback } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { previousDropdownFocusIdStackState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdStackState';

import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useCloseDropdown = () => {
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();

  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const closeDropdown = useCallback(
    (dropdownComponentInstanceIdFromProps?: string) => {
      const dropdownComponentInstanceId =
        dropdownComponentInstanceIdFromProps ??
        dropdownComponentInstanceIdFromContext;

      if (!isDefined(dropdownComponentInstanceId)) {
        throw new Error('Dropdown component instance ID is not defined');
      }

      const isDropdownOpen = store.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: dropdownComponentInstanceId,
        }),
      );

      if (!isDropdownOpen) {
        return;
      }

      removeFocusItemFromFocusStackById({
        focusId: dropdownComponentInstanceId,
      });

      const previousDropdownFocusIds = store
        .get(previousDropdownFocusIdStackState.atom)
        .filter((dropdownId) => dropdownId !== dropdownComponentInstanceId);
      const isActiveDropdown =
        store.get(activeDropdownFocusIdState.atom) ===
        dropdownComponentInstanceId;

      if (isActiveDropdown) {
        store.set(
          activeDropdownFocusIdState.atom,
          previousDropdownFocusIds.pop() ?? null,
        );
      }

      store.set(
        previousDropdownFocusIdStackState.atom,
        previousDropdownFocusIds,
      );

      store.set(
        isDropdownOpenComponentState.atomFamily({
          instanceId: dropdownComponentInstanceId,
        }),
        false,
      );
    },
    [
      removeFocusItemFromFocusStackById,
      dropdownComponentInstanceIdFromContext,
      store,
    ],
  );

  return {
    closeDropdown,
  };
};
