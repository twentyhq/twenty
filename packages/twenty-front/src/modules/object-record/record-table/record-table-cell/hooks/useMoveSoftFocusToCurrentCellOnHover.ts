import { useRecoilCallback } from 'recoil';

import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';

import { currentTableCellInEditModePositionState } from '../../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeScopedFamilyState } from '../../states/isTableCellInEditModeScopedFamilyState';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useSetSoftFocusOnCurrentTableCell } from './useSetSoftFocusOnCurrentTableCell';

export const useMoveSoftFocusToCurrentCellOnHover = () => {
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = snapshot
          .getLoadable(currentTableCellInEditModePositionState)
          .valueOrThrow();

        const isSomeCellInEditMode = snapshot.getLoadable(
          isTableCellInEditModeScopedFamilyState(
            currentTableCellInEditModePosition,
          ),
        );

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        if (
          currentHotkeyScope.scope !== TableHotkeyScope.TableSoftFocus &&
          currentHotkeyScope.scope !== TableHotkeyScope.CellEditMode &&
          currentHotkeyScope.scope !== TableHotkeyScope.Table
        ) {
          return;
        }

        if (!isSomeCellInEditMode.contents) {
          setSoftFocusOnCurrentTableCell();
        }
      },
    [setSoftFocusOnCurrentTableCell],
  );
};
