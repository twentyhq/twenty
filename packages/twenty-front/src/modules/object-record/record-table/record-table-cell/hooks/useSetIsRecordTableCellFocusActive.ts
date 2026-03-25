import { useCallback } from 'react';
import { useStore } from 'jotai';

import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useSetIsRecordTableCellFocusActive = (recordTableId?: string) => {
  const store = useStore();
  const isRecordTableCellFocusActive = useAtomComponentStateCallbackState(
    isRecordTableCellFocusActiveComponentState,
    recordTableId,
  );

  const recordTableFocusPosition = useAtomComponentStateCallbackState(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const setIsRecordTableCellFocusActive = useCallback(
    ({
      isRecordTableFocusActive,
      cellPosition,
    }: {
      isRecordTableFocusActive: boolean;
      cellPosition: TableCellPosition;
    }) => {
      if (isRecordTableFocusActive) {
        store.set(isRecordTableCellFocusActive, true);
        store.set(recordTableFocusPosition, cellPosition);
      } else {
        store.set(isRecordTableCellFocusActive, false);
        store.set(recordTableFocusPosition, null);
      }
    },
    [store, isRecordTableCellFocusActive, recordTableFocusPosition],
  );

  return {
    setIsRecordTableCellFocusActive,
  };
};
