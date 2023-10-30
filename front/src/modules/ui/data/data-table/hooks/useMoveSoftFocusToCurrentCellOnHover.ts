import { useRecoilCallback } from 'recoil';

import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';

import { currentTableCellInEditModePositionState } from '../states/currentTableCellInEditModePositionState';
import { isTableCellInEditModeFamilyState } from '../states/isTableCellInEditModeFamilyState';
import { useSetSoftFocusOnCurrentTableCell } from '../table-cell/hooks/useSetSoftFocusOnCurrentTableCell';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

export const useMoveSoftFocusToCurrentCellOnHover = () => {
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = snapshot
          .getLoadable(currentTableCellInEditModePositionState)
          .valueOrThrow();

        const isSomeCellInEditMode = snapshot.getLoadable(
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        );

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        if (
          currentHotkeyScope.scope !== TableHotkeyScope.TableSoftFocus &&
          currentHotkeyScope.scope !== TableHotkeyScope.CellEditMode
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
