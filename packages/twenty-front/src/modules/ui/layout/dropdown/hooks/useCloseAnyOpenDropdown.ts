import { useCallback } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useCloseAnyOpenDropdown = () => {
  const { closeDropdown } = useCloseDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();

  const closeAnyOpenDropdown = useCallback(() => {
    const previousDropdownFocusId = store.get(
      previousDropdownFocusIdState.atom,
    );

    const activeDropdownFocusId = store.get(activeDropdownFocusIdState.atom);

    const thereIsNoDropdownOpen =
      !isDefined(activeDropdownFocusId) && !isDefined(previousDropdownFocusId);

    if (thereIsNoDropdownOpen) {
      return;
    }

    const thereIsOneNestedDropdownOpen = isDefined(previousDropdownFocusId);

    if (isDefined(activeDropdownFocusId)) {
      closeDropdown(activeDropdownFocusId);
      removeFocusItemFromFocusStackById({
        focusId: activeDropdownFocusId,
      });
    }

    if (thereIsOneNestedDropdownOpen) {
      closeDropdown(previousDropdownFocusId);
      removeFocusItemFromFocusStackById({
        focusId: previousDropdownFocusId,
      });
    }

    store.set(previousDropdownFocusIdState.atom, null);
    store.set(activeDropdownFocusIdState.atom, null);
  }, [closeDropdown, removeFocusItemFromFocusStackById, store]);

  return { closeAnyOpenDropdown };
};
