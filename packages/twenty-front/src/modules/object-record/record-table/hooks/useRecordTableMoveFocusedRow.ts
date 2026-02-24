import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableMoveFocusedRow = (recordTableId?: string) => {
  const { focusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const focusedRowIndexAtom = useRecoilComponentStateCallbackStateV2(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsAtom = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveFocusedRowUp = useCallback(() => {
    const focusedRowIndex = store.get(focusedRowIndexAtom) as
      | number
      | null
      | undefined;

    if (!isDefined(focusedRowIndex)) {
      focusRecordTableRow(0);
      return;
    }

    let newRowIndex = focusedRowIndex - 1;

    if (newRowIndex < 0) {
      newRowIndex = 0;
    }

    focusRecordTableRow(newRowIndex);
  }, [store, focusedRowIndexAtom, focusRecordTableRow]);

  const moveFocusedRowDown = useCallback(() => {
    const allRecordIds = store.get(recordIndexAllRecordIdsAtom);
    const focusedRowIndex = store.get(focusedRowIndexAtom) as
      | number
      | null
      | undefined;

    if (!isDefined(focusedRowIndex)) {
      focusRecordTableRow(0);
      return;
    }

    let newRowIndex = focusedRowIndex + 1;

    if (newRowIndex >= allRecordIds.length) {
      newRowIndex = allRecordIds.length - 1;
    }

    focusRecordTableRow(newRowIndex);
  }, [
    recordIndexAllRecordIdsAtom,
    focusedRowIndexAtom,
    focusRecordTableRow,
    store,
  ]);

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
