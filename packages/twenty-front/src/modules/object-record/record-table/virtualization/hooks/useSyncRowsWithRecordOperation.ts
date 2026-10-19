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
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { numberOfPendingPageFetchesComponentState } from '@/object-record/record-table/virtualization/states/numberOfPendingPageFetchesComponentState';
import { syncedRecordOperationKeysComponentState } from '@/object-record/record-table/virtualization/states/syncedRecordOperationKeysComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { getRowIndexToInsertRecord } from '@/object-record/record-table/virtualization/utils/getRowIndexToInsertRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useSyncRowsWithRecordOperation = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { filter, orderBy } =
    useFindManyRecordIndexTableParams(objectNameSingular);

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const hasAnySoftDeleteFilterOnViewCallbackState =
    useAtomComponentSelectorCallbackState(
      hasAnySoftDeleteFilterOnViewComponentSelector,
    );

  const numberOfPendingPageFetchesCallbackState =
    useAtomComponentStateCallbackState(
      numberOfPendingPageFetchesComponentState,
    );

  const syncedRecordOperationKeysCallbackState =
    useAtomComponentStateCallbackState(syncedRecordOperationKeysComponentState);

  const { allocateRowSlots } = useAllocateRowSlots();
  const { triggerFetchPages } = useTriggerFetchPages();

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

  const canShiftRows = useCallback(
    () =>
      !store.get(hasAnySoftDeleteFilterOnViewCallbackState) &&
      store.get(numberOfPendingPageFetchesCallbackState) === 0,
    [
      hasAnySoftDeleteFilterOnViewCallbackState,
      numberOfPendingPageFetchesCallbackState,
      store,
    ],
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

  const syncRowsWithCreatedRecord = useCallback(
    (createdRecord: ObjectRecord): boolean => {
      const operationKey = `create-${createdRecord.id}`;

      if (hasSyncedOperation(operationKey)) {
        return true;
      }

      const recordIdsCallbackState = recordIdsByGroupCallbackState(
        NO_RECORD_GROUP_FAMILY_KEY,
      );

      const recordIds = store.get(recordIdsCallbackState);
      const loadedRowIndex = recordIds.indexOf(createdRecord.id);

      if (loadedRowIndex >= 0) {
        store.set(totalNumberOfRowsCallbackState, (totalNumberOfRows) =>
          Math.max(totalNumberOfRows ?? 0, loadedRowIndex + 1),
        );
        markOperationAsSynced(operationKey);

        return true;
      }

      if (!canShiftRows()) {
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

      const loadedRows: { rowIndex: number; record: ObjectRecord }[] = [];

      recordIds.forEach((recordId, rowIndex) => {
        const record = store.get(recordStoreFamilyState.atomFamily(recordId));

        if (isDefined(record)) {
          loadedRows.push({ rowIndex, record });
        }
      });

      const totalNumberOfRows = store.get(totalNumberOfRowsCallbackState) ?? 0;

      const rowIndexToInsert = getRowIndexToInsertRecord({
        loadedRows,
        record: createdRecord,
        totalNumberOfRows,
        orderBy,
      });

      if (!isDefined(rowIndexToInsert)) {
        return false;
      }

      if (rowIndexToInsert < recordIds.length) {
        const nextRecordIds = recordIds.slice();

        nextRecordIds.splice(rowIndexToInsert, 0, createdRecord.id);
        delete nextRecordIds[rowIndexToInsert];

        store.set(recordIdsCallbackState, nextRecordIds);
      }

      store.set(totalNumberOfRowsCallbackState, totalNumberOfRows + 1);
      markOperationAsSynced(operationKey);

      allocateRowSlots();
      triggerFetchPages();

      return true;
    },
    [
      allocateRowSlots,
      canShiftRows,
      hasSyncedOperation,
      isRecordInView,
      markOperationAsSynced,
      orderBy,
      recordIdsByGroupCallbackState,
      store,
      totalNumberOfRowsCallbackState,
      triggerFetchPages,
    ],
  );

  const syncRowsWithDeletedRecords = useCallback(
    (deletedRecordIds: string[]): boolean => {
      const recordIdsCallbackState = recordIdsByGroupCallbackState(
        NO_RECORD_GROUP_FAMILY_KEY,
      );

      for (const deletedRecordId of deletedRecordIds) {
        const operationKey = `delete-${deletedRecordId}`;

        if (hasSyncedOperation(operationKey)) {
          continue;
        }

        const recordIds = store.get(recordIdsCallbackState);
        const loadedRowIndex = recordIds.indexOf(deletedRecordId);

        if (!canShiftRows() || loadedRowIndex < 0) {
          return false;
        }

        const nextRecordIds = recordIds.slice();

        nextRecordIds.splice(loadedRowIndex, 1);

        store.set(recordIdsCallbackState, nextRecordIds);
        store.set(totalNumberOfRowsCallbackState, (totalNumberOfRows) =>
          Math.max(0, (totalNumberOfRows ?? 0) - 1),
        );
        markOperationAsSynced(operationKey);
      }

      allocateRowSlots();
      triggerFetchPages();

      return true;
    },
    [
      allocateRowSlots,
      canShiftRows,
      hasSyncedOperation,
      markOperationAsSynced,
      recordIdsByGroupCallbackState,
      store,
      totalNumberOfRowsCallbackState,
      triggerFetchPages,
    ],
  );

  return {
    forgetSyncedDeletionOfRecords,
    syncRowsWithCreatedRecord,
    syncRowsWithDeletedRecords,
  };
};
