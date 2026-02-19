import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useStore } from 'jotai';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStack = () => {
  const store = useStore();

  const resetFocusStack = useCallback(() => {
    store.set(focusStackState.atom, []);

    if (DEBUG_FOCUS_STACK) {
      logDebug(`DEBUG: reset focus stack`);
    }
  }, [store]);

  return { resetFocusStack };
};
