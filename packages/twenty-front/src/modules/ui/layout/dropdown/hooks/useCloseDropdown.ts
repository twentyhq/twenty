import { useCallback } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';

import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';

export const useCloseDropdown = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

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

      const isDropdownOpen = jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: dropdownComponentInstanceId,
        }),
      );

      if (isDropdownOpen) {
        removeFocusItemFromFocusStackById({
          focusId: dropdownComponentInstanceId,
        });

        goBackToPreviousDropdownFocusId();

        jotaiStore.set(
          isDropdownOpenComponentState.atomFamily({
            instanceId: dropdownComponentInstanceId,
          }),
          false,
        );
      }
    },
    [
      removeFocusItemFromFocusStackById,
      goBackToPreviousDropdownFocusId,
      dropdownComponentInstanceIdFromContext,
    ],
  );

  return {
    closeDropdown,
  };
};
