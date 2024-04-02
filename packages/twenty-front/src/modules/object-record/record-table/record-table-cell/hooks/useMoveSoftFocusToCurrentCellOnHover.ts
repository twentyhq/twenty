import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useSetSoftFocusOnCurrentTableCell } from './useSetSoftFocusOnCurrentTableCell';

export const useMoveSoftFocusToCurrentCellOnHover = () => {
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  const {
    currentTableCellInEditModePositionState,
    isTableCellInEditModeFamilyState,
  } = useRecordTableStates();

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
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
          setSoftFocusOnCurrentTableCell();
        }
      },
    [
      currentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
      setSoftFocusOnCurrentTableCell,
    ],
  );
};
