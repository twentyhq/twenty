import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { currentHotkeysScopeState } from '@/hotkeys/states/internal/currentHotkeysScopeState';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';

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
      },
    [setHotkeysScope, closeCurrentCellInEditMode, disableSoftFocus],
  );
}
