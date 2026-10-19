import { isNull } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useShiftVirtualRows } from '@/object-record/record-table/virtualization/hooks/useShiftVirtualRows';
import { numberOfPendingPageFetchesComponentState } from '@/object-record/record-table/virtualization/states/numberOfPendingPageFetchesComponentState';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { syncedRecordOperationKeysComponentState } from '@/object-record/record-table/virtualization/states/syncedRecordOperationKeysComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { type LoadedVirtualRow } from '@/object-record/record-table/virtualization/types/LoadedVirtualRow';
import { getVirtualRowInsertionRealIndex } from '@/object-record/record-table/virtualization/utils/getVirtualRowInsertionRealIndex';
import { getVirtualRowRemovalRealIndex } from '@/object-record/record-table/virtualization/utils/getVirtualRowRemovalRealIndex';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useSyncVirtualRowsWithRecordOperation = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { filter, orderBy } =
    useFindManyRecordIndexTableParams(objectNameSingular);

  const hasAnySoftDeleteFilterOnViewCallbackState =
    useAtomComponentSelectorCallbackState(
      hasAnySoftDeleteFilterOnViewComponentSelector,
    );

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

  const syncedRecordOperationKeysCallbackState =
    useAtomComponentStateCallbackState(syncedRecordOperationKeysComponentState);

  const { insertVirtualRowAtRealIndex, removeVirtualRowAtRealIndex } =
    useShiftVirtualRows();

  const hasSyncedOperation = useCallback(
    (operationKey: string) =>
      store.get(syncedRecordOperationKeysCallbackState).has(operationKey),
    [store, syncedRecordOperationKeysCallbackState],
  );

  const markOperationAsSynced = useCallback(
    (operationKey: string) =>
      store.set(syncedRecordOperationKeysCallbackState, (operationKeys) =>
        new Set(operationKeys).add(operationKey),
      ),
    [store, syncedRecordOperationKeysCallbackState],
  );

  const forgetSyncedDeletionOfRecords = useCallback(
    (recordIds: string[]) =>
      store.set(syncedRecordOperationKeysCallbackState, (operationKeys) => {
        const remainingOperationKeys = new Set(operationKeys);

        for (const recordId of recordIds) {
          remainingOperationKeys.delete(`delete-${recordId}`);
        }

        return remainingOperationKeys;
      }),
    [store, syncedRecordOperationKeysCallbackState],
  );

  const getLoadedVirtualRows = useCallback((): LoadedVirtualRow[] => {
    const loadedRows: LoadedVirtualRow[] = [];

    for (const [realIndex, recordId] of store.get(
      recordIdByRealIndexCallbackState,
    )) {
      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      if (isDefined(record)) {
        loadedRows.push({ realIndex, record });
      }
    }

    return loadedRows.toSorted((rowA, rowB) => rowA.realIndex - rowB.realIndex);
  }, [recordIdByRealIndexCallbackState, store]);

  const getLoadedRealIndexOfRecord = useCallback(
    (recordId: string): number | null => {
      for (const [realIndex, loadedRecordId] of store.get(
        recordIdByRealIndexCallbackState,
      )) {
        if (loadedRecordId === recordId) {
          return realIndex;
        }
      }

      return null;
    },
    [recordIdByRealIndexCallbackState, store],
  );

  const isRecordInView = useCallback(
    (record: ObjectRecord): boolean | null => {
      try {
        return isRecordMatchingFilter({
          record,
          filter,
          objectMetadataItem,
          objectMetadataItems,
        });
      } catch {
        return null;
      }
    },
    [filter, objectMetadataItem, objectMetadataItems],
  );

  const canShiftVirtualRows = useCallback(
    () =>
      !store.get(hasAnySoftDeleteFilterOnViewCallbackState) &&
      store.get(numberOfPendingPageFetchesCallbackState) === 0,
    [
      hasAnySoftDeleteFilterOnViewCallbackState,
      numberOfPendingPageFetchesCallbackState,
      store,
    ],
  );

  const syncVirtualRowsWithCreatedRecord = useCallback(
    (createdRecord: ObjectRecord): boolean => {
      const operationKey = `create-${createdRecord.id}`;

      if (hasSyncedOperation(operationKey)) {
        return true;
      }

      const loadedRealIndex = getLoadedRealIndexOfRecord(createdRecord.id);

      if (isDefined(loadedRealIndex)) {
        store.set(totalNumberOfRecordsToVirtualizeCallbackState, (total) =>
          Math.max(total ?? 0, loadedRealIndex + 1),
        );
        markOperationAsSynced(operationKey);

        return true;
      }

      if (!canShiftVirtualRows()) {
        return false;
      }

      const isInView = isRecordInView(createdRecord);

      if (isNull(isInView)) {
        return false;
      }

      if (!isInView) {
        markOperationAsSynced(operationKey);

        return true;
      }

      const insertionRealIndex = getVirtualRowInsertionRealIndex({
        loadedRows: getLoadedVirtualRows(),
        record: createdRecord,
        totalNumberOfRecordsToVirtualize:
          store.get(totalNumberOfRecordsToVirtualizeCallbackState) ?? 0,
        orderBy,
      });

      if (!isDefined(insertionRealIndex)) {
        return false;
      }

      insertVirtualRowAtRealIndex(insertionRealIndex);
      markOperationAsSynced(operationKey);

      return true;
    },
    [
      canShiftVirtualRows,
      getLoadedRealIndexOfRecord,
      getLoadedVirtualRows,
      hasSyncedOperation,
      insertVirtualRowAtRealIndex,
      isRecordInView,
      markOperationAsSynced,
      orderBy,
      store,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  const syncVirtualRowsWithDeletedRecords = useCallback(
    (deletedRecordIds: string[]): boolean => {
      for (const deletedRecordId of deletedRecordIds) {
        const operationKey = `delete-${deletedRecordId}`;

        if (hasSyncedOperation(operationKey)) {
          continue;
        }

        if (!canShiftVirtualRows()) {
          return false;
        }

        const loadedRealIndex = getLoadedRealIndexOfRecord(deletedRecordId);

        if (isDefined(loadedRealIndex)) {
          removeVirtualRowAtRealIndex(loadedRealIndex);
          markOperationAsSynced(operationKey);

          continue;
        }

        const deletedRecord = store.get(
          recordStoreFamilyState.atomFamily(deletedRecordId),
        );

        if (!isDefined(deletedRecord)) {
          return false;
        }

        const isInView = isRecordInView(deletedRecord);

        if (isNull(isInView)) {
          return false;
        }

        if (!isInView) {
          markOperationAsSynced(operationKey);

          continue;
        }

        const removalRealIndex = getVirtualRowRemovalRealIndex({
          loadedRows: getLoadedVirtualRows(),
          record: deletedRecord,
          totalNumberOfRecordsToVirtualize:
            store.get(totalNumberOfRecordsToVirtualizeCallbackState) ?? 0,
          orderBy,
        });

        if (
          !isDefined(removalRealIndex) ||
          store.get(recordIdByRealIndexCallbackState).has(removalRealIndex)
        ) {
          return false;
        }

        removeVirtualRowAtRealIndex(removalRealIndex);
        markOperationAsSynced(operationKey);
      }

      return true;
    },
    [
      canShiftVirtualRows,
      getLoadedRealIndexOfRecord,
      getLoadedVirtualRows,
      hasSyncedOperation,
      isRecordInView,
      markOperationAsSynced,
      orderBy,
      recordIdByRealIndexCallbackState,
      removeVirtualRowAtRealIndex,
      store,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  return {
    forgetSyncedDeletionOfRecords,
    syncVirtualRowsWithCreatedRecord,
    syncVirtualRowsWithDeletedRecords,
  };
};
