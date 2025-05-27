import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilCallback } from 'recoil';

export const useRemoveFocusIdFromFocusStack = () => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  return useRecoilCallback(
    ({ set }) =>
      ({ focusId, memoizeKey }: { focusId: string; memoizeKey: string }) => {
        set(focusStackState, (previousFocusStack) =>
          previousFocusStack.filter(
            (focusStackItem) => focusStackItem.focusId !== focusId,
          ),
        );

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        goBackToPreviousHotkeyScope(memoizeKey);
      },
    [goBackToPreviousHotkeyScope],
  );
};
