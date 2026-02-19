import { useCallback } from 'react';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useStore } from 'jotai';

// TODO: this won't work for more than 1 nested dropdown
export const useGoBackToPreviousDropdownFocusId = () => {
  const store = useStore();

  const goBackToPreviousDropdownFocusId = useCallback(() => {
    const previouslyFocusedDropdownId = store.get(
      previousDropdownFocusIdState.atom,
    );

    store.set(activeDropdownFocusIdState.atom, previouslyFocusedDropdownId);
    store.set(previousDropdownFocusIdState.atom, null);
  }, [store]);

  return {
    goBackToPreviousDropdownFocusId,
  };
};
