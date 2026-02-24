import { useCallback } from 'react';
import { useStore } from 'jotai';

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
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useFocusedRecordTableRow = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const isRowFocusedState = useRecoilComponentFamilyStateCallbackStateV2(
    isRecordTableRowFocusedComponentFamilyState,
    recordTableIdFromContext,
  );

  const store = useStore();
  const focusedRowIndex = useRecoilComponentStateCallbackStateV2(
    focusedRecordTableRowIndexComponentState,
    recordTableIdFromContext,
  );

  const isRowFocusActive = useRecoilComponentStateCallbackStateV2(
    isRecordTableRowFocusActiveComponentState,
    recordTableIdFromContext,
  );

  const focusedCellPosition = useRecoilComponentStateCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableIdFromContext,
  );

  const isRecordTableCellFocusActive = useRecoilComponentStateCallbackStateV2(
    isRecordTableCellFocusActiveComponentState,
    recordTableIdFromContext,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(
    recordTableIdFromContext,
  );

  const unfocusRecordTableRow = useCallback(() => {
    const currentFocusedRowIndex = store.get(focusedRowIndex);

    if (!isDefined(currentFocusedRowIndex)) {
      return;
    }

    const focusId = getRecordTableRowFocusId({
      recordTableId: recordTableIdFromContext,
      rowIndex: currentFocusedRowIndex,
    });

    removeFocusItemFromFocusStackById({
      focusId,
    });

    store.set(focusedRowIndex, null);
    store.set(isRowFocusedState(currentFocusedRowIndex), false);
    store.set(isRowFocusActive, false);
  }, [
    store,
    focusedRowIndex,
    isRowFocusedState,
    isRowFocusActive,
    recordTableIdFromContext,
    removeFocusItemFromFocusStackById,
  ]);

  const focusRecordTableRow = useCallback(
    (rowIndex: number) => {
      const currentFocusedRowIndex = store.get(focusedRowIndex);

      if (
        isDefined(currentFocusedRowIndex) &&
        currentFocusedRowIndex !== rowIndex
      ) {
        store.set(isRowFocusedState(currentFocusedRowIndex), false);

        const focusId = getRecordTableRowFocusId({
          recordTableId: recordTableIdFromContext,
          rowIndex: currentFocusedRowIndex,
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

      store.set(focusedRowIndex, rowIndex);
      store.set(isRowFocusedState(rowIndex), true);
      store.set(isRowFocusActive, true);
    },
    [
      store,
      focusedRowIndex,
      recordTableIdFromContext,
      pushFocusItemToFocusStack,
      isRowFocusedState,
      isRowFocusActive,
      removeFocusItemFromFocusStackById,
    ],
  );

  const restoreRecordTableRowFocusFromCellPosition = useCallback(() => {
    const currentFocusedRowIndex = store.get(focusedRowIndex);

    const currentFocusedCellPosition = store.get(focusedCellPosition);

    const currentIsRecordTableCellFocusActive = store.get(
      isRecordTableCellFocusActive,
    );

    if (
      !isDefined(currentFocusedCellPosition) ||
      !currentIsRecordTableCellFocusActive
    ) {
      return;
    }

    unfocusRecordTableCell();

    if (isDefined(currentFocusedRowIndex)) {
      focusRecordTableRow(currentFocusedCellPosition.row);
    }
  }, [
    store,
    focusedRowIndex,
    focusedCellPosition,
    isRecordTableCellFocusActive,
    unfocusRecordTableCell,
    focusRecordTableRow,
  ]);

  return {
    focusRecordTableRow,
    unfocusRecordTableRow,
    restoreRecordTableRowFocusFromCellPosition,
  };
};
