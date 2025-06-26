import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

export const useRemoveFocusItemFromFocusStackById = () => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const removeFocusItemFromFocusStackById = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ focusId }: { focusId: string }) => {
        const focusStack = snapshot.getLoadable(focusStackState).getValue();

        const removedFocusItem = focusStack.find(
          (focusStackItem) => focusStackItem.focusId === focusId,
        );

        if (!removedFocusItem) {
          return;
        }

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
        goBackToPreviousHotkeyScope(removedFocusItem.memoizeKey);
      },
    [goBackToPreviousHotkeyScope],
  );

  return { removeFocusItemFromFocusStackById };
};
