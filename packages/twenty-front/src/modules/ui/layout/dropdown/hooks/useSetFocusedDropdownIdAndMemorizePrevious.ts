import { useCallback } from 'react';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const useSetActiveDropdownFocusIdAndMemorizePrevious = () => {
  const setActiveDropdownFocusIdAndMemorizePrevious = useCallback(
    (dropdownId: string | null) => {
      const activeDropdownFocusId = jotaiStore.get(
        activeDropdownFocusIdState.atom,
      );

      if (activeDropdownFocusId === dropdownId) {
        return;
      }

      jotaiStore.set(previousDropdownFocusIdState.atom, activeDropdownFocusId);
      jotaiStore.set(activeDropdownFocusIdState.atom, dropdownId);
    },
    [],
  );

  return {
    setActiveDropdownFocusIdAndMemorizePrevious,
  };
};
