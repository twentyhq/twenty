import { useCallback } from 'react';
import { useStore } from 'jotai';

import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

export const useSetIsRecordTableCellFocusActive = (recordTableId?: string) => {
  const store = useStore();
  const isRecordTableCellFocusActiveAtom =
    useRecoilComponentStateCallbackStateV2(
      isRecordTableCellFocusActiveComponentState,
      recordTableId,
    );

  const recordTableFocusPositionAtom = useRecoilComponentStateCallbackStateV2(
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
        store.set(isRecordTableCellFocusActiveAtom, true);
        store.set(recordTableFocusPositionAtom, cellPosition);
      } else {
        store.set(isRecordTableCellFocusActiveAtom, false);
        store.set(recordTableFocusPositionAtom, null);
      }
    },
    [store, isRecordTableCellFocusActiveAtom, recordTableFocusPositionAtom],
  );

  return {
    setIsRecordTableCellFocusActive,
  };
};
