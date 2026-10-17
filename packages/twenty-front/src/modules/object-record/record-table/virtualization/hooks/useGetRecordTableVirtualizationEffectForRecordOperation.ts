import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { type RecordTableVirtualizationEffect } from '@/object-record/record-table/virtualization/types/RecordTableVirtualizationEffect';
import { getRecordTableVirtualizationEffectForRecordOutsideWindow } from '@/object-record/record-table/virtualization/utils/getRecordTableVirtualizationEffectForRecordOutsideWindow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useGetRecordTableVirtualizationEffectForRecordOperation = () => {
  const store = useStore();
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { orderBy } = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordIdByRealIndexCallbackState = useAtomComponentStateCallbackState(
    recordIdByRealIndexComponentState,
  );

  const totalNumberOfRecordsToVirtualizeCallbackState =
    useAtomComponentStateCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const getEffectForRecordOutsideWindow = useCallback(
    (record: ObjectRecord): RecordTableVirtualizationEffect => {
      const recordIdByRealIndex = store.get(recordIdByRealIndexCallbackState);

      let lastLoadedRealIndex: number | null = null;
      let lastLoadedRecordId: string | null = null;

      for (const [realIndex, recordId] of recordIdByRealIndex) {
        if (
          !isDefined(lastLoadedRealIndex) ||
          realIndex > lastLoadedRealIndex
        ) {
          lastLoadedRealIndex = realIndex;
          lastLoadedRecordId = recordId;
        }
      }

      const lastLoadedRecord = isDefined(lastLoadedRecordId)
        ? store.get(recordStoreFamilyState.atomFamily(lastLoadedRecordId))
        : null;

      return getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record,
        lastLoadedRecord,
        lastLoadedRealIndex,
        totalNumberOfRecordsToVirtualize: store.get(
          totalNumberOfRecordsToVirtualizeCallbackState,
        ),
        orderBy,
      });
    },
    [
      orderBy,
      recordIdByRealIndexCallbackState,
      store,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  const getEffectForCreatedRecord = useCallback(
    (createdRecord: ObjectRecord): RecordTableVirtualizationEffect =>
      getEffectForRecordOutsideWindow(createdRecord),
    [getEffectForRecordOutsideWindow],
  );

  const getEffectForDeletedRecordIds = useCallback(
    (deletedRecordIds: string[]): RecordTableVirtualizationEffect => {
      const loadedRecordIds = new Set(
        store.get(recordIdByRealIndexCallbackState).values(),
      );

      for (const deletedRecordId of deletedRecordIds) {
        if (loadedRecordIds.has(deletedRecordId)) {
          return 'reset';
        }

        const deletedRecord = store.get(
          recordStoreFamilyState.atomFamily(deletedRecordId),
        );

        if (
          !isDefined(deletedRecord) ||
          getEffectForRecordOutsideWindow(deletedRecord) === 'reset'
        ) {
          return 'reset';
        }
      }

      return 'refresh-count';
    },
    [getEffectForRecordOutsideWindow, recordIdByRealIndexCallbackState, store],
  );

  return { getEffectForCreatedRecord, getEffectForDeletedRecordIds };
};
