import { useCallback } from 'react';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useStore } from 'jotai';

export const useSetActiveDropdownFocusIdAndMemorizePrevious = () => {
  const store = useStore();

  const setActiveDropdownFocusIdAndMemorizePrevious = useCallback(
    (dropdownId: string | null) => {
      const activeDropdownFocusId = store.get(activeDropdownFocusIdState.atom);

      if (activeDropdownFocusId === dropdownId) {
        return;
      }

      store.set(previousDropdownFocusIdState.atom, activeDropdownFocusId);
      store.set(activeDropdownFocusIdState.atom, dropdownId);
    },
    [store],
  );

  return {
    setActiveDropdownFocusIdAndMemorizePrevious,
  };
};
