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
    const previousStack = store.get(previousDropdownFocusIdState.atom);
    const activeDropdownFocusId = store.get(activeDropdownFocusIdState.atom);

    const thereIsNoDropdownOpen =
      !isDefined(activeDropdownFocusId) && previousStack.length === 0;

    if (thereIsNoDropdownOpen) {
      return;
    }

    if (isDefined(activeDropdownFocusId)) {
      closeDropdown(activeDropdownFocusId);
      removeFocusItemFromFocusStackById({
        focusId: activeDropdownFocusId,
      });
    }

    for (const previousId of previousStack) {
      closeDropdown(previousId);
      removeFocusItemFromFocusStackById({
        focusId: previousId,
      });
    }

    store.set(previousDropdownFocusIdState.atom, []);
    store.set(activeDropdownFocusIdState.atom, null);
  }, [closeDropdown, removeFocusItemFromFocusStackById, store]);

  return { closeAnyOpenDropdown };
};
