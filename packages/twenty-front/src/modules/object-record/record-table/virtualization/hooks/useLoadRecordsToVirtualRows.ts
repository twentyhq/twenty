import { useCallback } from 'react';
import { useStore } from 'jotai';

import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { dataLoadingStatusByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentState';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

export const useLoadRecordsToVirtualRows = () => {
  const recordIdByRealIndex = useRecoilComponentStateCallbackStateV2(
    recordIdByRealIndexComponentState,
  );

  const dataLoadingStatusByRealIndex = useRecoilComponentStateCallbackStateV2(
    dataLoadingStatusByRealIndexComponentState,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const hasUserSelectedAllRows = useRecoilComponentStateCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyStateCallbackStateV2(
    isRowSelectedComponentFamilyState,
  );

  const store = useStore();

  const loadRecordsToVirtualRows = useCallback(
    ({
      records,
      startingRealIndex,
    }: {
      records: ObjectRecord[];
      startingRealIndex: number;
    }) => {
      const isAllRowsSelected = store.get(hasUserSelectedAllRows);

      const currentRecordIdMap = store.get(recordIdByRealIndex);
      const newRecordIdMap = new Map(currentRecordIdMap);
      const currentStatusMap = store.get(dataLoadingStatusByRealIndex);
      const newStatusMap = new Map(currentStatusMap);

      for (const [recordIndex, record] of records.entries()) {
        const realIndex = startingRealIndex + recordIndex;

        if (record.id !== currentRecordIdMap.get(realIndex)) {
          newRecordIdMap.set(realIndex, record.id);
        }

        newStatusMap.set(realIndex, 'loaded');
      }

      store.set(recordIdByRealIndex, newRecordIdMap);
      store.set(dataLoadingStatusByRealIndex, newStatusMap);

      const currentAllRecordIds = store.get(
        recordIndexRecordIdsByGroupFamilyState(NO_RECORD_GROUP_FAMILY_KEY),
      );

      const recordIds = records.map((record) => record.id);

      const newAllRecordIds = currentAllRecordIds.concat();

      for (let i = 0; i < records.length; i++) {
        newAllRecordIds[i + startingRealIndex] = recordIds[i];

        if (isAllRowsSelected) {
          store.set(isRowSelectedFamilyState(recordIds[i]), true);
        }
      }

      store.set(
        recordIndexRecordIdsByGroupFamilyState(NO_RECORD_GROUP_FAMILY_KEY),
        newAllRecordIds,
      );
    },
    [
      recordIdByRealIndex,
      dataLoadingStatusByRealIndex,
      recordIndexRecordIdsByGroupFamilyState,
      isRowSelectedFamilyState,
      hasUserSelectedAllRows,
      store,
    ],
  );

  return {
    loadRecordsToVirtualRows,
  };
};
