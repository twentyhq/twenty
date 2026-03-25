import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useStore } from 'jotai';
import { logDebug } from '~/utils/logDebug';

export const useRemoveFocusItemFromFocusStackById = () => {
  const store = useStore();

  const removeFocusItemFromFocusStackById = useCallback(
    ({ focusId }: { focusId: string }) => {
      const focusStack = store.get(focusStackState.atom);

      const removedFocusItem = focusStack.find(
        (focusStackItem) => focusStackItem.focusId === focusId,
      );

      if (!removedFocusItem) {
        return;
      }

      const newFocusStack = focusStack.filter(
        (focusStackItem) => focusStackItem.focusId !== focusId,
      );

      store.set(focusStackState.atom, newFocusStack);

      if (DEBUG_FOCUS_STACK) {
        logDebug(`DEBUG: removeFocusItemFromFocusStack ${focusId}`, {
          newFocusStack,
        });
      }
    },
    [store],
  );

  return { removeFocusItemFromFocusStackById };
};
