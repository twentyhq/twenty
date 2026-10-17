import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { numberOfPendingPageFetchesComponentState } from '@/object-record/record-table/virtualization/states/numberOfPendingPageFetchesComponentState';
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

  const numberOfPendingPageFetchesCallbackState =
    useAtomComponentStateCallbackState(
      numberOfPendingPageFetchesComponentState,
    );

  const getLoadedWindow = useCallback(() => {
    let lastLoadedRealIndex: number | null = null;
    let lastLoadedRecordId: string | null = null;

    for (const [realIndex, recordId] of store.get(
      recordIdByRealIndexCallbackState,
    )) {
      if (!isDefined(lastLoadedRealIndex) || realIndex > lastLoadedRealIndex) {
        lastLoadedRealIndex = realIndex;
        lastLoadedRecordId = recordId;
      }
    }

    return {
      lastLoadedRealIndex,
      lastLoadedRecord: isDefined(lastLoadedRecordId)
        ? store.get(recordStoreFamilyState.atomFamily(lastLoadedRecordId))
        : null,
      totalNumberOfRecordsToVirtualize: store.get(
        totalNumberOfRecordsToVirtualizeCallbackState,
      ),
      isLoadingPages: store.get(numberOfPendingPageFetchesCallbackState) > 0,
    };
  }, [
    numberOfPendingPageFetchesCallbackState,
    recordIdByRealIndexCallbackState,
    store,
    totalNumberOfRecordsToVirtualizeCallbackState,
  ]);

  const getEffectForCreatedRecord = useCallback(
    (createdRecord: ObjectRecord): RecordTableVirtualizationEffect =>
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: createdRecord,
        orderBy,
        ...getLoadedWindow(),
      }),
    [getLoadedWindow, orderBy],
  );

  const getEffectForDeletedRecordIds = useCallback(
    (deletedRecordIds: string[]): RecordTableVirtualizationEffect => {
      const loadedRecordIds = new Set(
        store.get(recordIdByRealIndexCallbackState).values(),
      );

      const loadedWindow = getLoadedWindow();

      for (const deletedRecordId of deletedRecordIds) {
        if (loadedRecordIds.has(deletedRecordId)) {
          return 'reset';
        }

        const deletedRecord = store.get(
          recordStoreFamilyState.atomFamily(deletedRecordId),
        );

        if (
          !isDefined(deletedRecord) ||
          getRecordTableVirtualizationEffectForRecordOutsideWindow({
            record: deletedRecord,
            orderBy,
            ...loadedWindow,
          }) === 'reset'
        ) {
          return 'reset';
        }
      }

      return 'refresh-count';
    },
    [getLoadedWindow, orderBy, recordIdByRealIndexCallbackState, store],
  );

  return { getEffectForCreatedRecord, getEffectForDeletedRecordIds };
};
