import { useCurrentHotkeysScope } from '@/hotkeys/hooks/useCurrentHotkeysScope';
import { useResetHotkeysScopeStack } from '@/hotkeys/hooks/useResetHotkeysScopeStack';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { useCloseCurrentCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export function useLeaveTableFocus() {
  const resetHotkeysScopeStack = useResetHotkeysScopeStack();
  const currentHotkeysScope = useCurrentHotkeysScope();

  const disableSoftFocus = useDisableSoftFocus();
  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  return async function leaveTableFocus() {
    if (currentHotkeysScope?.scope === InternalHotkeysScope.Table) {
      return;
    }

    closeCurrentCellInEditMode();
    disableSoftFocus();
    resetHotkeysScopeStack(InternalHotkeysScope.Table);
  };
}
