import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { useStore } from 'jotai';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStackToFocusItem = () => {
  const store = useStore();

  const resetFocusStackToFocusItem = useCallback(
    ({ focusStackItem }: { focusStackItem: FocusStackItem }) => {
      store.set(focusStackState.atom, [focusStackItem]);

      if (DEBUG_FOCUS_STACK) {
        logDebug(`DEBUG: reset focus stack to focus item`, {
          focusStackItem,
        });
      }
    },
    [store],
  );

  return { resetFocusStackToFocusItem };
};
