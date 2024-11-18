import { useRecoilCallback } from 'recoil';

import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { tableAllRowIdsComponentState } from '@/object-record/record-table/states/tableAllRowIdsComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useSelectAllRows = (recordTableId?: string) => {
  const allRowsSelectedStatusSelector = useRecoilComponentCallbackStateV2(
    allRowsSelectedStatusComponentSelector,
    recordTableId,
  );
  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );
  const tableAllRowIdsState = useRecoilComponentCallbackStateV2(
    tableAllRowIdsComponentState,
    recordTableId,
  );

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = getSnapshotValue(
          snapshot,
          allRowsSelectedStatusSelector,
        );

        const tableRowIds = getSnapshotValue(snapshot, tableAllRowIdsState);

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
      allRowsSelectedStatusSelector,
      tableAllRowIdsState,
      isRowSelectedFamilyState,
    ],
  );

  return {
    selectAllRows,
  };
};
