import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableMoveFocusedRow = (recordTableId?: string) => {
  const { focusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const focusedRowIndexState = useRecoilComponentCallbackState(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsAtom = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveFocusedRowUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const focusedRowIndex = getSnapshotValue(
          snapshot,
          focusedRowIndexState,
        );

        if (!isDefined(focusedRowIndex)) {
          focusRecordTableRow(0);
          return;
        }

        let newRowIndex = focusedRowIndex - 1;

        if (newRowIndex < 0) {
          newRowIndex = 0;
        }

        focusRecordTableRow(newRowIndex);
      },
    [focusedRowIndexState, focusRecordTableRow],
  );

  const moveFocusedRowDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = store.get(recordIndexAllRecordIdsAtom);
        const focusedRowIndex = getSnapshotValue(
          snapshot,
          focusedRowIndexState,
        );

        if (!isDefined(focusedRowIndex)) {
          focusRecordTableRow(0);
          return;
        }

        let newRowIndex = focusedRowIndex + 1;

        if (newRowIndex >= allRecordIds.length) {
          newRowIndex = allRecordIds.length - 1;
        }

        focusRecordTableRow(newRowIndex);
      },
    [
      recordIndexAllRecordIdsAtom,
      focusedRowIndexState,
      focusRecordTableRow,
      store,
    ],
  );

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
