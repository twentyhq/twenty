import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';
import { currentHotkeysScopeState } from '@/lib/hotkeys/states/internal/currentHotkeysScopeState';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useCloseCurrentCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export function useLeaveTableFocus() {
  const disableSoftFocus = useDisableSoftFocus();
  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const setHotkeysScope = useSetHotkeyScope();

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

        if (currentHotkeysScope?.scope === TableHotkeyScope.Table) {
          return;
        }

        closeCurrentCellInEditMode();
        disableSoftFocus();

        setHotkeysScope(TableHotkeyScope.Table, { goto: true });
      },
    [setHotkeysScope, closeCurrentCellInEditMode, disableSoftFocus],
  );
}
