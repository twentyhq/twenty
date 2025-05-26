import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableMoveFocusedRow = (recordTableId?: string) => {
  const { focusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const focusedRowIndexState = useRecoilComponentCallbackStateV2(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

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
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );
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
      recordIndexAllRecordIdsSelector,
      focusedRowIndexState,
      focusRecordTableRow,
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
