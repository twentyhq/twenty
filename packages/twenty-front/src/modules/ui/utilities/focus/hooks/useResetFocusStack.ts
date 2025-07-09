import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStack = () => {
  const resetFocusStack = useRecoilCallback(
    ({ reset }) =>
      () => {
        reset(focusStackState);

        if (DEBUG_FOCUS_STACK) {
          logDebug(`DEBUG: reset focus stack`);
        }
      },
    [],
  );

  return { resetFocusStack };
};
