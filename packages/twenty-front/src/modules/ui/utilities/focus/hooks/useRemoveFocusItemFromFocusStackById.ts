import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { logDebug } from '~/utils/logDebug';

export const useRemoveFocusItemFromFocusStackById = () => {
  const removeFocusItemFromFocusStackById = useCallback(
    ({ focusId }: { focusId: string }) => {
      const focusStack = jotaiStore.get(focusStackState.atom);

      const removedFocusItem = focusStack.find(
        (focusStackItem) => focusStackItem.focusId === focusId,
      );

      if (!removedFocusItem) {
        return;
      }

      const newFocusStack = focusStack.filter(
        (focusStackItem) => focusStackItem.focusId !== focusId,
      );

      jotaiStore.set(focusStackState.atom, newFocusStack);

      if (DEBUG_FOCUS_STACK) {
        logDebug(`DEBUG: removeFocusItemFromFocusStack ${focusId}`, {
          newFocusStack,
        });
      }
    },
    [],
  );

  return { removeFocusItemFromFocusStackById };
};
