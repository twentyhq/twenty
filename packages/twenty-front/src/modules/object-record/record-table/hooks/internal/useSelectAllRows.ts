import { useRecoilCallback } from 'recoil';

import { recordIndexAllRowIdsComponentState } from '@/object-record/record-index/states/recordIndexAllRowIdsComponentState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
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
  const recordIndexAllRowIdsState = useRecoilComponentCallbackStateV2(
    recordIndexAllRowIdsComponentState,
    recordTableId,
  );

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = getSnapshotValue(
          snapshot,
          allRowsSelectedStatusSelector,
        );

        const allRowIds = getSnapshotValue(snapshot, recordIndexAllRowIdsState);

        if (
          allRowsSelectedStatus === 'none' ||
          allRowsSelectedStatus === 'some'
        ) {
          for (const rowId of allRowIds) {
            set(isRowSelectedFamilyState(rowId), true);
          }
        } else {
          for (const rowId of allRowIds) {
            set(isRowSelectedFamilyState(rowId), false);
          }
        }
      },
    [
      allRowsSelectedStatusSelector,
      recordIndexAllRowIdsState,
      isRowSelectedFamilyState,
    ],
  );

  return {
    selectAllRows,
  };
};
