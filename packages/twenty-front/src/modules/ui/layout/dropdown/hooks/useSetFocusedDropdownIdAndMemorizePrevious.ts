import { useCallback } from 'react';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdStackState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdStackState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSetActiveDropdownFocusIdAndMemorizePrevious = () => {
  const store = useStore();

  const setActiveDropdownFocusIdAndMemorizePrevious = useCallback(
    (dropdownId: string | null) => {
      const activeDropdownFocusId = store.get(activeDropdownFocusIdState.atom);

      if (activeDropdownFocusId === dropdownId) {
        return;
      }

      if (isDefined(activeDropdownFocusId) && isDefined(dropdownId)) {
        const previousStack = store.get(previousDropdownFocusIdStackState.atom);
        store.set(previousDropdownFocusIdStackState.atom, [
          ...previousStack,
          activeDropdownFocusId,
        ]);
      }

      store.set(activeDropdownFocusIdState.atom, dropdownId);
    },
    [store],
  );

  return {
    setActiveDropdownFocusIdAndMemorizePrevious,
  };
};
