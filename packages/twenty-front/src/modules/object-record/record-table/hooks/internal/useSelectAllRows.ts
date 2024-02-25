import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useSelectAllRows = (recordTableId?: string) => {
  const {
    getAllRowsSelectedStatusSelector,
    getTableRowIdsState,
    isRowSelectedFamilyState,
  } = useRecordTableStates(recordTableId);

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = getSnapshotValue(
          snapshot,
          getAllRowsSelectedStatusSelector(),
        );

        const tableRowIds = getSnapshotValue(snapshot, getTableRowIdsState());

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
    [
      getAllRowsSelectedStatusSelector,
      getTableRowIdsState,
      isRowSelectedFamilyState,
    ],
  );

  return {
    selectAllRows,
  };
};
