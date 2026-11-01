import { useStore } from 'jotai';
import { useCallback } from 'react';

import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { placeRecordIdsAtRowIndexes } from '@/object-record/record-table/virtualization/utils/placeRecordIdsAtRowIndexes';
import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useLoadRecordsAtRowIndexes = () => {
  const store = useStore();

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const hasUserSelectedAllRecordsCallbackState =
    useAtomComponentStateCallbackState(hasUserSelectedAllRecordsComponentState);

  const isRecordSelectedCallbackState =
    useAtomComponentFamilyStateCallbackState(
      isRecordSelectedComponentFamilyState,
    );

  const { allocateRowSlots } = useAllocateRowSlots();

  const loadRecordsAtRowIndexes = useCallback(
    ({
      records,
      startingRowIndex,
    }: {
      records: ObjectRecord[];
      startingRowIndex: number;
    }) => {
      const recordIdsCallbackState = recordIdsByGroupCallbackState(
        NO_RECORD_GROUP_FAMILY_KEY,
      );

      const isAllRowsSelected = store.get(
        hasUserSelectedAllRecordsCallbackState,
      );

      const nextRecordIds = placeRecordIdsAtRowIndexes({
        recordIdsByRowIndex: store.get(recordIdsCallbackState),
        recordIds: records.map((record) => record.id),
        startingRowIndex,
      });

      if (isAllRowsSelected) {
        for (const record of records) {
          store.set(isRecordSelectedCallbackState(record.id), true);
        }
      }

      store.set(recordIdsCallbackState, nextRecordIds);

      allocateRowSlots();
    },
    [
      allocateRowSlots,
      hasUserSelectedAllRecordsCallbackState,
      isRecordSelectedCallbackState,
      recordIdsByGroupCallbackState,
      store,
    ],
  );

  return { loadRecordsAtRowIndexes };
};
