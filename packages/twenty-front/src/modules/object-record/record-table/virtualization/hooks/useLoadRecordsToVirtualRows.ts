import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { dataLoadingStatusByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilySelector';
import { recordIdByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useLoadRecordsToVirtualRows = () => {
  const recordIdByRealIndexCallbackSelector =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilySelector,
    );

  const dataLoadingStatusByRealIndexCallbackSelector =
    useRecoilComponentFamilyCallbackState(
      dataLoadingStatusByRealIndexComponentFamilySelector,
    );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const hasUserSelectedAllRowsCallbackState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
  );

  const isRowSelectedCallbackState = useRecoilComponentCallbackState(
    isRowSelectedComponentFamilyState,
  );

  const loadRecordsToVirtualRows = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        records,
        startingRealIndex,
      }: {
        records: ObjectRecord[];
        startingRealIndex: number;
      }) => {
        const hasUserSelectedAllRows = getSnapshotValue(
          snapshot,
          hasUserSelectedAllRowsCallbackState,
        );

        for (const [recordIndex, record] of records.entries()) {
          const realIndex = startingRealIndex + recordIndex;

          const currentRecordIdAtRealIndex = getSnapshotValue(
            snapshot,
            recordIdByRealIndexCallbackSelector(realIndex),
          );

          if (record.id !== currentRecordIdAtRealIndex) {
            set(recordIdByRealIndexCallbackSelector(realIndex), record.id);
          }

          set(
            dataLoadingStatusByRealIndexCallbackSelector(realIndex),
            'loaded',
          );
        }

        const currentAllRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        const recordIds = records.map((record) => record.id);

        const newAllRecordIds = currentAllRecordIds.concat();

        for (let i = 0; i < records.length; i++) {
          newAllRecordIds[i + startingRealIndex] = recordIds[i];

          if (hasUserSelectedAllRows) {
            set(isRowSelectedCallbackState(recordIds[i]), true);
          }
        }

        set(recordIndexAllRecordIdsSelector, newAllRecordIds);
      },
    [
      recordIdByRealIndexCallbackSelector,
      dataLoadingStatusByRealIndexCallbackSelector,
      recordIndexAllRecordIdsSelector,
      isRowSelectedCallbackState,
      hasUserSelectedAllRowsCallbackState,
    ],
  );

  return {
    loadRecordsToVirtualRows,
  };
};
