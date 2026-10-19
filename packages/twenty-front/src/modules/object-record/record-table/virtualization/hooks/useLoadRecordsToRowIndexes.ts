import { useStore } from 'jotai';
import { useCallback } from 'react';

import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useLoadRecordsToRowIndexes = () => {
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

  const loadRecordsToRowIndexes = useCallback(
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

      const nextRecordIds = store.get(recordIdsCallbackState).slice();

      records.forEach((record, recordIndex) => {
        nextRecordIds[startingRowIndex + recordIndex] = record.id;

        if (isAllRowsSelected) {
          store.set(isRecordSelectedCallbackState(record.id), true);
        }
      });

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

  return { loadRecordsToRowIndexes };
};
