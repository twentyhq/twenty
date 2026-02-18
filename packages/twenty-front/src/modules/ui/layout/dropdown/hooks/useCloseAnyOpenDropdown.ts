import { useCallback } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';

export const useCloseAnyOpenDropdown = () => {
  const { closeDropdown } = useCloseDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeAnyOpenDropdown = useCallback(() => {
    const previousDropdownFocusId = jotaiStore.get(
      previousDropdownFocusIdState.atom,
    );

    const activeDropdownFocusId = jotaiStore.get(
      activeDropdownFocusIdState.atom,
    );

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

    jotaiStore.set(previousDropdownFocusIdState.atom, null);
    jotaiStore.set(activeDropdownFocusIdState.atom, null);
  }, [closeDropdown, removeFocusItemFromFocusStackById]);

  return { closeAnyOpenDropdown };
};
