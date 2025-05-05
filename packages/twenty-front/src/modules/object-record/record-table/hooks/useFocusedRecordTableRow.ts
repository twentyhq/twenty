import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { isRecordTableFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableFocusActiveComponentState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useFocusedRecordTableRow = (recordTableId?: string) => {
  const isRowFocusedState = useRecoilComponentCallbackStateV2(
    isRecordTableRowFocusedComponentFamilyState,
    recordTableId,
  );

  const focusedRowIndexState = useRecoilComponentCallbackStateV2(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const isRowFocusActiveState = useRecoilComponentCallbackStateV2(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  const focusedCellPositionState = useRecoilComponentCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const isRecordTableFocusActiveState = useRecoilComponentCallbackStateV2(
    isRecordTableFocusActiveComponentState,
    recordTableId,
  );

  const unfocusRecordTableRow = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const focusedRowIndex = snapshot
          .getLoadable(focusedRowIndexState)
          .getValue();

        if (!isDefined(focusedRowIndex)) {
          return;
        }

        set(focusedRowIndexState, null);
        set(isRowFocusedState(focusedRowIndex), false);
        set(isRowFocusActiveState, false);
      },
    [focusedRowIndexState, isRowFocusedState, isRowFocusActiveState],
  );

  const focusRecordTableRow = useRecoilCallback(
    ({ set, snapshot }) =>
      (rowIndex: number) => {
        const focusedRowIndex = snapshot
          .getLoadable(focusedRowIndexState)
          .getValue();

        if (isDefined(focusedRowIndex) && focusedRowIndex !== rowIndex) {
          set(isRowFocusedState(focusedRowIndex), false);
        }

        set(focusedRowIndexState, rowIndex);
        set(isRowFocusedState(rowIndex), true);
        set(isRowFocusActiveState, true);
      },
    [focusedRowIndexState, isRowFocusedState, isRowFocusActiveState],
  );

  const restoreRecordTableRowFocusFromCellPosition = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const focusedRowIndex = snapshot
          .getLoadable(focusedRowIndexState)
          .getValue();

        const focusedCellPosition = snapshot
          .getLoadable(focusedCellPositionState)
          .getValue();

        const isRecordTableFocusActive = snapshot
          .getLoadable(isRecordTableFocusActiveState)
          .getValue();

        if (
          !isDefined(focusedRowIndex) ||
          !isDefined(focusedCellPosition) ||
          !isRecordTableFocusActive
        ) {
          return;
        }

        focusRecordTableRow(focusedCellPosition.row);
      },
    [
      focusedRowIndexState,
      focusedCellPositionState,
      isRecordTableFocusActiveState,
      focusRecordTableRow,
    ],
  );

  return {
    focusRecordTableRow,
    unfocusRecordTableRow,
    restoreRecordTableRowFocusFromCellPosition,
  };
};
