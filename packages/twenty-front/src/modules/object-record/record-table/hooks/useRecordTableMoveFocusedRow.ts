import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableMoveFocusedRow = (recordTableId?: string) => {
  const { focusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const focusedRowIndex = useAtomComponentStateCallbackState(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveFocusedRowUp = useCallback(() => {
    const currentFocusedRowIndex = store.get(focusedRowIndex);

    if (!isDefined(currentFocusedRowIndex)) {
      focusRecordTableRow(0);
      return;
    }

    let newRowIndex = currentFocusedRowIndex - 1;

    if (newRowIndex < 0) {
      newRowIndex = 0;
    }

    focusRecordTableRow(newRowIndex);
  }, [store, focusedRowIndex, focusRecordTableRow]);

  const moveFocusedRowDown = useCallback(() => {
    const allRecordIds = store.get(recordIndexAllRecordIds);
    const currentFocusedRowIndex = store.get(focusedRowIndex);

    if (!isDefined(currentFocusedRowIndex)) {
      focusRecordTableRow(0);
      return;
    }

    let newRowIndex = currentFocusedRowIndex + 1;

    if (newRowIndex >= allRecordIds.length) {
      newRowIndex = allRecordIds.length - 1;
    }

    focusRecordTableRow(newRowIndex);
  }, [recordIndexAllRecordIds, focusedRowIndex, focusRecordTableRow, store]);

  const moveFocusedRow = (direction: MoveFocusDirection) => {
    if (direction === 'up') {
      moveFocusedRowUp();
    } else if (direction === 'down') {
      moveFocusedRowDown();
    }
  };

  return {
    moveFocusedRowUp,
    moveFocusedRowDown,
    moveFocusedRow,
  };
};
