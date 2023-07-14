import { useRecoilCallback } from 'recoil';

import { useSetHotkeysScope } from '@/lib/hotkeys/hooks/useSetHotkeysScope';
import { currentHotkeysScopeState } from '@/lib/hotkeys/states/internal/currentHotkeysScopeState';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';
import { HotkeyScope } from '../types/HotkeyScope';

import { useCloseCurrentCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export function useLeaveTableFocus() {
  const disableSoftFocus = useDisableSoftFocus();
  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const setHotkeysScope = useSetHotkeysScope();

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSoftFocusActive = snapshot
          .getLoadable(isSoftFocusActiveState)
          .valueOrThrow();

        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        const currentHotkeysScope = snapshot
          .getLoadable(currentHotkeysScopeState)
          .valueOrThrow();

        if (isSomeInputInEditMode) {
          return;
        }

        if (!isSoftFocusActive && !isSomeInputInEditMode) {
          return;
        }

        if (currentHotkeysScope?.scope === HotkeyScope.Table) {
          return;
        }

        closeCurrentCellInEditMode();
        disableSoftFocus();

        setHotkeysScope(HotkeyScope.Table, { goto: true });
      },
    [setHotkeysScope, closeCurrentCellInEditMode, disableSoftFocus],
  );
}
