import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStack = () => {
  const resetFocusStack = useCallback(() => {
    jotaiStore.set(focusStackState.atom, []);

    if (DEBUG_FOCUS_STACK) {
      logDebug(`DEBUG: reset focus stack`);
    }
  }, []);

  return { resetFocusStack };
};
