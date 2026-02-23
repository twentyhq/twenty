import { useRecoilCallback } from 'recoil';

import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { dataLoadingStatusByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilySelector';
import { recordIdByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useStore } from 'jotai';
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

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const hasUserSelectedAllRowsCallbackState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyStateCallbackStateV2(
    isRowSelectedComponentFamilyState,
  );

  const store = useStore();

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

        const currentAllRecordIds = store.get(
          recordIndexRecordIdsByGroupFamilyState(NO_RECORD_GROUP_FAMILY_KEY),
        );

        const recordIds = records.map((record) => record.id);

        const newAllRecordIds = currentAllRecordIds.concat();

        for (let i = 0; i < records.length; i++) {
          newAllRecordIds[i + startingRealIndex] = recordIds[i];

          if (hasUserSelectedAllRows) {
            store.set(isRowSelectedFamilyState(recordIds[i]), true);
          }
        }

        store.set(
          recordIndexRecordIdsByGroupFamilyState(NO_RECORD_GROUP_FAMILY_KEY),
          newAllRecordIds,
        );
      },
    [
      recordIdByRealIndexCallbackSelector,
      dataLoadingStatusByRealIndexCallbackSelector,
      recordIndexRecordIdsByGroupFamilyState,
      isRowSelectedFamilyState,
      hasUserSelectedAllRowsCallbackState,
      store,
    ],
  );

  return {
    loadRecordsToVirtualRows,
  };
};
