import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { activeRecordTableRowIndexComponentState } from '@/object-record/record-table/states/activeRecordTableRowIndexComponentState';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableMoveActiveRow = (recordTableId?: string) => {
  const { activateRecordTableRow } = useActiveRecordTableRow(recordTableId);

  const activeRowIndexState = useRecoilComponentCallbackStateV2(
    activeRecordTableRowIndexComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const moveActiveRowUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const activeRowIndex = getSnapshotValue(snapshot, activeRowIndexState);

        if (!isDefined(activeRowIndex)) {
          activateRecordTableRow(0);
          return;
        }

        let newRowIndex = activeRowIndex - 1;

        if (newRowIndex < 0) {
          newRowIndex = 0;
        }

        activateRecordTableRow(newRowIndex);
      },
    [activeRowIndexState, activateRecordTableRow],
  );

  const moveActiveRowDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );
        const activeRowIndex = getSnapshotValue(snapshot, activeRowIndexState);

        if (!isDefined(activeRowIndex)) {
          activateRecordTableRow(0);
          return;
        }

        let newRowIndex = activeRowIndex + 1;

        if (newRowIndex >= allRecordIds.length) {
          newRowIndex = allRecordIds.length - 1;
        }

        activateRecordTableRow(newRowIndex);
      },
    [
      recordIndexAllRecordIdsSelector,
      activeRowIndexState,
      activateRecordTableRow,
    ],
  );

  const moveActiveRow = (direction: MoveFocusDirection) => {
    if (direction === 'up') {
      moveActiveRowUp();
    } else if (direction === 'down') {
      moveActiveRowDown();
    }
  };

  return {
    moveActiveRowUp,
    moveActiveRowDown,
    moveActiveRow,
  };
};
