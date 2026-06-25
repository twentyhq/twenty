import { useCallback } from 'react';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdStackState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdStackState';
import { useStore } from 'jotai';

export const useGoBackToPreviousDropdownFocusId = () => {
  const store = useStore();

  const goBackToPreviousDropdownFocusId = useCallback(() => {
    const previousStack = store.get(previousDropdownFocusIdStackState.atom);

    const previouslyFocusedDropdownId =
      previousStack[previousStack.length - 1] ?? null;

    store.set(activeDropdownFocusIdState.atom, previouslyFocusedDropdownId);
    store.set(
      previousDropdownFocusIdStackState.atom,
      previousStack.slice(0, -1),
    );
  }, [store]);

  return {
    goBackToPreviousDropdownFocusId,
  };
};
