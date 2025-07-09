import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { getRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/utils/getRecordTableRowFocusId';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useFocusedRecordTableRow = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const isRowFocusedState = useRecoilComponentCallbackStateV2(
    isRecordTableRowFocusedComponentFamilyState,
    recordTableIdFromContext,
  );

  const focusedRowIndexState = useRecoilComponentCallbackStateV2(
    focusedRecordTableRowIndexComponentState,
    recordTableIdFromContext,
  );

  const isRowFocusActiveState = useRecoilComponentCallbackStateV2(
    isRecordTableRowFocusActiveComponentState,
    recordTableIdFromContext,
  );

  const focusedCellPositionState = useRecoilComponentCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableIdFromContext,
  );

  const isRecordTableCellFocusActiveState = useRecoilComponentCallbackStateV2(
    isRecordTableCellFocusActiveComponentState,
    recordTableIdFromContext,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(
    recordTableIdFromContext,
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

        const focusId = getRecordTableRowFocusId({
          recordTableId: recordTableIdFromContext,
          rowIndex: focusedRowIndex,
        });

        removeFocusItemFromFocusStackById({
          focusId,
        });

        set(focusedRowIndexState, null);
        set(isRowFocusedState(focusedRowIndex), false);
        set(isRowFocusActiveState, false);
      },
    [
      focusedRowIndexState,
      isRowFocusedState,
      isRowFocusActiveState,
      recordTableIdFromContext,
      removeFocusItemFromFocusStackById,
    ],
  );

  const focusRecordTableRow = useRecoilCallback(
    ({ set, snapshot }) =>
      (rowIndex: number) => {
        const focusedRowIndex = snapshot
          .getLoadable(focusedRowIndexState)
          .getValue();

        if (isDefined(focusedRowIndex) && focusedRowIndex !== rowIndex) {
          set(isRowFocusedState(focusedRowIndex), false);

          const focusId = getRecordTableRowFocusId({
            recordTableId: recordTableIdFromContext,
            rowIndex: focusedRowIndex,
          });

          removeFocusItemFromFocusStackById({
            focusId,
          });
        }

        const focusId = getRecordTableRowFocusId({
          recordTableId: recordTableIdFromContext,
          rowIndex,
        });

        pushFocusItemToFocusStack({
          focusId,
          component: {
            type: FocusComponentType.RECORD_TABLE_ROW,
            instanceId: focusId,
          },
        });

        set(focusedRowIndexState, rowIndex);
        set(isRowFocusedState(rowIndex), true);
        set(isRowFocusActiveState, true);
      },
    [
      focusedRowIndexState,
      recordTableIdFromContext,
      pushFocusItemToFocusStack,
      isRowFocusedState,
      isRowFocusActiveState,
      removeFocusItemFromFocusStackById,
    ],
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

        const isRecordTableCellFocusActive = snapshot
          .getLoadable(isRecordTableCellFocusActiveState)
          .getValue();

        if (!isDefined(focusedCellPosition) || !isRecordTableCellFocusActive) {
          return;
        }

        unfocusRecordTableCell();

        if (isDefined(focusedRowIndex)) {
          focusRecordTableRow(focusedCellPosition.row);
        }
      },
    [
      focusedRowIndexState,
      focusedCellPositionState,
      isRecordTableCellFocusActiveState,
      unfocusRecordTableCell,
      focusRecordTableRow,
    ],
  );

  return {
    focusRecordTableRow,
    unfocusRecordTableRow,
    restoreRecordTableRowFocusFromCellPosition,
  };
};
