import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStackToFocusItem = () => {
  const resetFocusStackToFocusItem = useCallback(
    ({ focusStackItem }: { focusStackItem: FocusStackItem }) => {
      jotaiStore.set(focusStackState.atom, [focusStackItem]);

      if (DEBUG_FOCUS_STACK) {
        logDebug(`DEBUG: reset focus stack to focus item`, {
          focusStackItem,
        });
      }
    },
    [],
  );

  return { resetFocusStackToFocusItem };
};
