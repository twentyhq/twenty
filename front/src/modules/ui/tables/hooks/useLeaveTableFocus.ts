import { useRecoilValue } from 'recoil';

import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { currentHotkeysScopeState } from '@/hotkeys/states/internal/currentHotkeysScopeState';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';

import { useCloseCurrentCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export function useLeaveTableFocus() {
  const currentHotkeysScope = useRecoilValue(currentHotkeysScopeState);

  const disableSoftFocus = useDisableSoftFocus();
  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const setHotkeysScope = useSetHotkeysScope();

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

    setHotkeysScope(InternalHotkeysScope.Table, { goto: true });
  };
}
