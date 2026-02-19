import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { type FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { logDebug } from '~/utils/logDebug';

export const useRemoveLastFocusItemFromFocusStackByComponentType = () => {
  const removeLastFocusItemFromFocusStackByComponentType = useCallback(
    ({ componentType }: { componentType: FocusComponentType }) => {
      const focusStack = jotaiStore.get(focusStackState.atom);

      const lastMatchingIndex = focusStack.findLastIndex(
        (focusStackItem) =>
          focusStackItem.componentInstance.componentType === componentType,
      );

      if (lastMatchingIndex === -1) {
        if (DEBUG_FOCUS_STACK) {
          logDebug(
            `DEBUG: removeFocusItemFromFocusStackByComponentType - no item found for type ${componentType}`,
            { focusStack },
          );
        }
        return;
      }

      const removedFocusItem = focusStack[lastMatchingIndex];
      const newFocusStack = focusStack.filter(
        (_, index) => index !== lastMatchingIndex,
      );

      jotaiStore.set(focusStackState.atom, newFocusStack);

      if (DEBUG_FOCUS_STACK) {
        logDebug(
          `DEBUG: removeFocusItemFromFocusStackByComponentType ${componentType}`,
          {
            removedFocusItem,
            newFocusStack,
          },
        );
      }
    },
    [],
  );

  return { removeLastFocusItemFromFocusStackByComponentType };
};
