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
  const focusedRowIndexAtom = useRecoilComponentStateCallbackStateV2(
    focusedRecordTableRowIndexComponentState,
    recordTableIdFromContext,
  );

  const isRowFocusActiveAtom = useRecoilComponentStateCallbackStateV2(
    isRecordTableRowFocusActiveComponentState,
    recordTableIdFromContext,
  );

  const focusedCellPositionAtom = useRecoilComponentStateCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableIdFromContext,
  );

  const isRecordTableCellFocusActiveAtom =
    useRecoilComponentStateCallbackStateV2(
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
    const focusedRowIndex = store.get(focusedRowIndexAtom) as
      | number
      | null
      | undefined;

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

    store.set(focusedRowIndexAtom, null);
    store.set(isRowFocusedState(focusedRowIndex), false);
    store.set(isRowFocusActiveAtom, false);
  }, [
    store,
    focusedRowIndexAtom,
    isRowFocusedState,
    isRowFocusActiveAtom,
    recordTableIdFromContext,
    removeFocusItemFromFocusStackById,
  ]);

  const focusRecordTableRow = useCallback(
    (rowIndex: number) => {
      const focusedRowIndex = store.get(focusedRowIndexAtom) as
        | number
        | null
        | undefined;

      if (isDefined(focusedRowIndex) && focusedRowIndex !== rowIndex) {
        store.set(isRowFocusedState(focusedRowIndex), false);

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

      store.set(focusedRowIndexAtom, rowIndex);
      store.set(isRowFocusedState(rowIndex), true);
      store.set(isRowFocusActiveAtom, true);
    },
    [
      store,
      focusedRowIndexAtom,
      recordTableIdFromContext,
      pushFocusItemToFocusStack,
      isRowFocusedState,
      isRowFocusActiveAtom,
      removeFocusItemFromFocusStackById,
    ],
  );

  const restoreRecordTableRowFocusFromCellPosition = useCallback(() => {
    const focusedRowIndex = store.get(focusedRowIndexAtom) as
      | number
      | null
      | undefined;

    const focusedCellPosition = store.get(focusedCellPositionAtom) as
      | { row: number; column: number }
      | null
      | undefined;

    const isRecordTableCellFocusActive = store.get(
      isRecordTableCellFocusActiveAtom,
    );

    if (!isDefined(focusedCellPosition) || !isRecordTableCellFocusActive) {
      return;
    }

    unfocusRecordTableCell();

    if (isDefined(focusedRowIndex)) {
      focusRecordTableRow(focusedCellPosition.row);
    }
  }, [
    store,
    focusedRowIndexAtom,
    focusedCellPositionAtom,
    isRecordTableCellFocusActiveAtom,
    unfocusRecordTableCell,
    focusRecordTableRow,
  ]);

  return {
    focusRecordTableRow,
    unfocusRecordTableRow,
    restoreRecordTableRowFocusFromCellPosition,
  };
};
