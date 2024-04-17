import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useSetSoftFocus } from '@/object-record/record-table/record-table-cell/hooks/useSetSoftFocus';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useMoveSoftFocusToCellOnHoverV2 = (recordTableId: string) => {
  const setSoftFocus = useSetSoftFocus(recordTableId);

  const {
    currentTableCellInEditModePositionState,
    isTableCellInEditModeFamilyState,
  } = useRecordTableStates(recordTableId);

  const moveSoftFocusToCell = useRecoilCallback(
    ({ snapshot }) =>
      (cellPosition: TableCellPosition) => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );

        const isSomeCellInEditMode = snapshot
          .getLoadable(
            isTableCellInEditModeFamilyState(
              currentTableCellInEditModePosition,
            ),
          )
          .getValue();

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();

        if (
          currentHotkeyScope.scope !== TableHotkeyScope.TableSoftFocus &&
          currentHotkeyScope.scope !== TableHotkeyScope.CellEditMode &&
          currentHotkeyScope.scope !== TableHotkeyScope.Table
        ) {
          return;
        }

        if (!isSomeCellInEditMode) {
          setSoftFocus(cellPosition);
        }
      },
    [
      currentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
      setSoftFocus,
    ],
  );

  return { moveSoftFocusToCell };
};
