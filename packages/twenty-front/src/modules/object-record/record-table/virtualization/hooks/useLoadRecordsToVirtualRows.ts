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
  const recordIdByRealIndexAtom = useRecoilComponentStateCallbackStateV2(
    recordIdByRealIndexComponentState,
  );

  const dataLoadingStatusByRealIndexAtom =
    useRecoilComponentStateCallbackStateV2(
      dataLoadingStatusByRealIndexComponentState,
    );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const hasUserSelectedAllRowsAtom = useRecoilComponentStateCallbackStateV2(
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
      const hasUserSelectedAllRows = store.get(hasUserSelectedAllRowsAtom);

      const currentRecordIdMap = store.get(recordIdByRealIndexAtom);
      const newRecordIdMap = new Map(currentRecordIdMap);
      const currentStatusMap = store.get(dataLoadingStatusByRealIndexAtom);
      const newStatusMap = new Map(currentStatusMap);

      for (const [recordIndex, record] of records.entries()) {
        const realIndex = startingRealIndex + recordIndex;

        if (record.id !== currentRecordIdMap.get(realIndex)) {
          newRecordIdMap.set(realIndex, record.id);
        }

        newStatusMap.set(realIndex, 'loaded');
      }

      store.set(recordIdByRealIndexAtom, newRecordIdMap);
      store.set(dataLoadingStatusByRealIndexAtom, newStatusMap);

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
      recordIdByRealIndexAtom,
      dataLoadingStatusByRealIndexAtom,
      recordIndexRecordIdsByGroupFamilyState,
      isRowSelectedFamilyState,
      hasUserSelectedAllRowsAtom,
      store,
    ],
  );

  return {
    loadRecordsToVirtualRows,
  };
};
