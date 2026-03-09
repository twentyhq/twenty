import { useCallback } from 'react';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useStore } from 'jotai';

export const useGoBackToPreviousDropdownFocusId = () => {
  const store = useStore();

  const goBackToPreviousDropdownFocusId = useCallback(() => {
    const previousStack = store.get(previousDropdownFocusIdState.atom);

    const previouslyFocusedDropdownId =
      previousStack[previousStack.length - 1] ?? null;

    store.set(activeDropdownFocusIdState.atom, previouslyFocusedDropdownId);
    store.set(previousDropdownFocusIdState.atom, previousStack.slice(0, -1));
  }, [store]);

  return {
    goBackToPreviousDropdownFocusId,
  };
};
