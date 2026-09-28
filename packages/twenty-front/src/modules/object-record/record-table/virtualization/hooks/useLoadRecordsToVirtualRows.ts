import { useCallback } from 'react';
import { useStore } from 'jotai';

import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { dataLoadingStatusByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentState';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useLoadRecordsToVirtualRows = () => {
  const recordIdByRealIndex = useAtomComponentStateCallbackState(
    recordIdByRealIndexComponentState,
  );

  const dataLoadingStatusByRealIndex = useAtomComponentStateCallbackState(
    dataLoadingStatusByRealIndexComponentState,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const hasUserSelectedAllRecords = useAtomComponentStateCallbackState(
    hasUserSelectedAllRecordsComponentState,
  );

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
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
      const isAllRowsSelected = store.get(hasUserSelectedAllRecords);

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

      const newAllRecordIds = currentAllRecordIds.concat();

      records.forEach((record, index) => {
        newAllRecordIds[index + startingRealIndex] = record.id;

        if (isAllRowsSelected) {
          store.set(isRowSelectedFamilyState(record.id), true);
        }
      });

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
      hasUserSelectedAllRecords,
      store,
    ],
  );

  return {
    loadRecordsToVirtualRows,
  };
};
