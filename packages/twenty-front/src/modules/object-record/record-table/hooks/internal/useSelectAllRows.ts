import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
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
  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = getSnapshotValue(
          snapshot,
          allRowsSelectedStatusSelector,
        );

        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        for (const recordId of allRecordIds) {
          const isSelected =
            allRowsSelectedStatus === 'none' ||
            allRowsSelectedStatus === 'some';

          set(isRowSelectedFamilyState(recordId), isSelected);
        }
      },
    [
      allRowsSelectedStatusSelector,
      recordIndexAllRecordIdsSelector,
      isRowSelectedFamilyState,
    ],
  );

  return {
    selectAllRows,
  };
};
