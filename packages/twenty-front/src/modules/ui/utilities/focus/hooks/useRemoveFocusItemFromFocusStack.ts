import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

export const useRemoveFocusItemFromFocusStack = () => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const removeFocusItemFromFocusStack = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ focusId, memoizeKey }: { focusId: string; memoizeKey: string }) => {
        const focusStack = snapshot.getLoadable(focusStackState).getValue();

        const newFocusStack = focusStack.filter(
          (focusStackItem) => focusStackItem.focusId !== focusId,
        );

        set(focusStackState, newFocusStack);

        if (DEBUG_FOCUS_STACK) {
          logDebug(`DEBUG: removeFocusItemFromFocusStack ${focusId}`, {
            newFocusStack,
          });
        }

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        goBackToPreviousHotkeyScope(memoizeKey);
      },
    [goBackToPreviousHotkeyScope],
  );

  return { removeFocusItemFromFocusStack };
};
