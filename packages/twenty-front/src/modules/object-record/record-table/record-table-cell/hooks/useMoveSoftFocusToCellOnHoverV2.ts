import { useRecoilCallback } from 'recoil';

import { useSetSoftFocus } from '@/object-record/record-table/record-table-cell/hooks/useSetSoftFocus';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useMoveSoftFocusToCellOnHoverV2 = (recordTableId: string) => {
  const setSoftFocus = useSetSoftFocus(recordTableId);

  const currentTableCellInEditModePositionState =
    useRecoilComponentCallbackStateV2(
      currentTableCellInEditModePositionComponentState,
      recordTableId,
    );
  const isTableCellInEditModeFamilyState = useRecoilComponentCallbackStateV2(
    isTableCellInEditModeComponentFamilyState,
    recordTableId,
  );

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
