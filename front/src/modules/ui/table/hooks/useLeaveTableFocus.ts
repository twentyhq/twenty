import { useRecoilCallback } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/hotkey/states/internal/currentHotkeyScopeState';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useCloseCurrentCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export function useLeaveTableFocus() {
  const disableSoftFocus = useDisableSoftFocus();
  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const setHotkeyScope = useSetHotkeyScope();

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSoftFocusActive = snapshot
          .getLoadable(isSoftFocusActiveState)
          .valueOrThrow();

        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        if (isSomeInputInEditMode) {
          return;
        }

        if (!isSoftFocusActive && !isSomeInputInEditMode) {
          return;
        }

        if (currentHotkeyScope?.scope === TableHotkeyScope.Table) {
          return;
        }

        closeCurrentCellInEditMode();
        disableSoftFocus();

        // setHotkeyScope(TableHotkeyScope.Table, { goto: true });
      },
    [setHotkeyScope, closeCurrentCellInEditMode, disableSoftFocus],
  );
}
