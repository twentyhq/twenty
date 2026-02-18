import { useCallback } from 'react';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

// TODO: this won't work for more than 1 nested dropdown
export const useGoBackToPreviousDropdownFocusId = () => {
  const goBackToPreviousDropdownFocusId = useCallback(() => {
    const previouslyFocusedDropdownId = jotaiStore.get(
      previousDropdownFocusIdState.atom,
    );

    jotaiStore.set(
      activeDropdownFocusIdState.atom,
      previouslyFocusedDropdownId,
    );
    jotaiStore.set(previousDropdownFocusIdState.atom, null);
  }, []);

  return {
    goBackToPreviousDropdownFocusId,
  };
};
