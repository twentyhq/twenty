import { useRecoilCallback } from 'recoil';

import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useCloseCurrentCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export const useLeaveTableFocus = () => {
  const disableSoftFocus = useDisableSoftFocus();
  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSoftFocusActive = snapshot
          .getLoadable(isSoftFocusActiveState)
          .valueOrThrow();

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        if (!isSoftFocusActive) {
          return;
        }

        if (currentHotkeyScope?.scope === TableHotkeyScope.Table) {
          return;
        }

        closeCurrentCellInEditMode();
        disableSoftFocus();
      },
    [closeCurrentCellInEditMode, disableSoftFocus],
  );
};
