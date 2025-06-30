import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { previousHotkeyScopeFamilyState } from '@/ui/utilities/hotkey/states/internal/previousHotkeyScopeFamilyState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStackToFocusItem = () => {
  const setHotkeyScope = useSetHotkeyScope();

  const resetFocusStackToFocusItem = useRecoilCallback(
    ({ set }) =>
      ({
        focusStackItem,
        hotkeyScope,
        memoizeKey = 'global',
      }: {
        focusStackItem: FocusStackItem;
        hotkeyScope: HotkeyScope;
        memoizeKey?: string;
      }) => {
        set(focusStackState, [focusStackItem]);

        if (DEBUG_FOCUS_STACK) {
          logDebug(`DEBUG: reset focus stack to focus item`, {
            focusStackItem,
          });
        }

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        set(previousHotkeyScopeFamilyState(memoizeKey), null);
        setHotkeyScope(hotkeyScope.scope, hotkeyScope.customScopes);
      },
    [setHotkeyScope],
  );

  return { resetFocusStackToFocusItem };
};
