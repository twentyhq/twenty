import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStackToFocusItem = () => {
  const resetFocusStackToFocusItem = useRecoilCallback(
    ({ set }) =>
      ({ focusStackItem }: { focusStackItem: FocusStackItem }) => {
        set(focusStackState, [focusStackItem]);

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
