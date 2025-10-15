import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { dataLoadingStatusByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilyState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useLoadRecordsToVirtualRows = () => {
  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const dataLoadingStatusByRealIndexCallbackState =
    useRecoilComponentCallbackState(
      dataLoadingStatusByRealIndexComponentFamilyState,
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
            recordIdByRealIndexCallbackState({ realIndex }),
          );

          if (record.id !== currentRecordIdAtRealIndex) {
            set(recordIdByRealIndexCallbackState({ realIndex }), record.id);
          }

          set(
            dataLoadingStatusByRealIndexCallbackState({ realIndex }),
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
      recordIdByRealIndexCallbackState,
      dataLoadingStatusByRealIndexCallbackState,
      recordIndexAllRecordIdsSelector,
      isRowSelectedCallbackState,
      hasUserSelectedAllRowsCallbackState,
    ],
  );

  return {
    loadRecordsToVirtualRows,
  };
};
