import { useRecoilCallback } from 'recoil';
import { getSnapshotValue } from 'twenty-ui';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const { tableRowIdsState, isRowSelectedFamilyState } =
    useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const tableRowIds = getSnapshotValue(snapshot, tableRowIdsState);

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }
      },
    [tableRowIdsState, isRowSelectedFamilyState],
  );
};
