import { useRecoilValue } from 'recoil';

import { useCurrentHotkeysScope } from '@/hotkeys/hooks/useCurrentHotkeysScope';
import { useResetHotkeysScopeStack } from '@/hotkeys/hooks/useResetHotkeysScopeStack';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';

import { useCloseCurrentCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export function useLeaveTableFocus() {
  const resetHotkeysScopeStack = useResetHotkeysScopeStack();
  const currentHotkeysScope = useCurrentHotkeysScope();

  const disableSoftFocus = useDisableSoftFocus();
  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const isSoftFocusActive = useRecoilValue(isSoftFocusActiveState);
  const isSomeInputInEditMode = useRecoilValue(isSomeInputInEditModeState);

  return async function leaveTableFocus() {
    // TODO: replace with scope ancestor ?
    if (!isSoftFocusActive && !isSomeInputInEditMode) {
      return;
    }

    if (currentHotkeysScope?.scope === InternalHotkeysScope.Table) {
      return;
    }

    closeCurrentCellInEditMode();
    disableSoftFocus();
    resetHotkeysScopeStack(InternalHotkeysScope.Table);
  };
}
