import { useRecoilCallback } from 'recoil';
import { getSnapshotValue } from 'twenty-ui';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useSelectAllRows = (recordTableId?: string) => {
  const {
    allRowsSelectedStatusSelector,
    tableRowIdsState,
    isRowSelectedFamilyState,
  } = useRecordTableStates(recordTableId);

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = getSnapshotValue(
          snapshot,
          allRowsSelectedStatusSelector(),
        );

        const tableRowIds = getSnapshotValue(snapshot, tableRowIdsState);

        if (
          allRowsSelectedStatus === 'none' ||
          allRowsSelectedStatus === 'some'
        ) {
          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), true);
          }
        } else {
          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), false);
          }
        }
      },
    [allRowsSelectedStatusSelector, tableRowIdsState, isRowSelectedFamilyState],
  );

  return {
    selectAllRows,
  };
};
