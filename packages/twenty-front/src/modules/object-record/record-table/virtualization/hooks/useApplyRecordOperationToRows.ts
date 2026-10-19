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
import { appliedRecordOperationKeysComponentState } from '@/object-record/record-table/virtualization/states/appliedRecordOperationKeysComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { insertEmptyRowAtIndex } from '@/object-record/record-table/virtualization/utils/insertEmptyRowAtIndex';
import { getRowIndexToInsertRecord } from '@/object-record/record-table/virtualization/utils/getRowIndexToInsertRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useApplyRecordOperationToRows = () => {
  const store = useStore();
  const { objectMetadataItem, recordLimit } = useRecordIndexContextOrThrow();
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

  const appliedRecordOperationKeysCallbackState =
    useAtomComponentStateCallbackState(
      appliedRecordOperationKeysComponentState,
    );

  const { allocateRowSlots } = useAllocateRowSlots();
  const { triggerFetchPages } = useTriggerFetchPages();

  const hasAppliedOperation = useCallback(
    (operationKey: string) =>
      store.get(appliedRecordOperationKeysCallbackState).has(operationKey),
    [store, appliedRecordOperationKeysCallbackState],
  );

  const markOperationAsApplied = useCallback(
    (operationKey: string) =>
      store.set(appliedRecordOperationKeysCallbackState, (operationKeys) =>
        new Set(operationKeys).add(operationKey),
      ),
    [store, appliedRecordOperationKeysCallbackState],
  );

  const forgetAppliedDeletionOfRecords = useCallback(
    (recordIds: string[]) =>
      store.set(appliedRecordOperationKeysCallbackState, (operationKeys) => {
        const remainingOperationKeys = new Set(operationKeys);

        for (const recordId of recordIds) {
          remainingOperationKeys.delete(`delete-${recordId}`);
        }

        return remainingOperationKeys;
      }),
    [store, appliedRecordOperationKeysCallbackState],
  );

  const canShiftRows = useCallback(
    () =>
      !isDefined(recordLimit) &&
      !store.get(hasAnySoftDeleteFilterOnViewCallbackState) &&
      store.get(numberOfPendingPageFetchesCallbackState) === 0,
    [
      hasAnySoftDeleteFilterOnViewCallbackState,
      numberOfPendingPageFetchesCallbackState,
      recordLimit,
      store,
    ],
  );

  const isRecordMatchingViewFilter = useCallback(
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

  const insertRowForCreatedRecord = useCallback(
    (createdRecord: ObjectRecord): boolean => {
      const operationKey = `create-${createdRecord.id}`;

      if (hasAppliedOperation(operationKey)) {
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
        markOperationAsApplied(operationKey);

        return true;
      }

      if (!canShiftRows()) {
        return false;
      }

      // false is not proof: unloaded relation values make the filter reject matching records
      if (isRecordMatchingViewFilter(createdRecord) !== true) {
        return false;
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

      store.set(
        recordIdsCallbackState,
        insertEmptyRowAtIndex({
          recordIdsByRowIndex: recordIds,
          rowIndex: rowIndexToInsert,
        }),
      );

      store.set(totalNumberOfRowsCallbackState, totalNumberOfRows + 1);
      markOperationAsApplied(operationKey);

      allocateRowSlots();
      triggerFetchPages();

      return true;
    },
    [
      allocateRowSlots,
      canShiftRows,
      hasAppliedOperation,
      isRecordMatchingViewFilter,
      markOperationAsApplied,
      orderBy,
      recordIdsByGroupCallbackState,
      store,
      totalNumberOfRowsCallbackState,
      triggerFetchPages,
    ],
  );

  const removeRowsOfDeletedRecords = useCallback(
    (deletedRecordIds: string[]): boolean => {
      const recordIdsCallbackState = recordIdsByGroupCallbackState(
        NO_RECORD_GROUP_FAMILY_KEY,
      );

      for (const deletedRecordId of deletedRecordIds) {
        const operationKey = `delete-${deletedRecordId}`;

        if (hasAppliedOperation(operationKey)) {
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
        markOperationAsApplied(operationKey);
      }

      allocateRowSlots();
      triggerFetchPages();

      return true;
    },
    [
      allocateRowSlots,
      canShiftRows,
      hasAppliedOperation,
      markOperationAsApplied,
      recordIdsByGroupCallbackState,
      store,
      totalNumberOfRowsCallbackState,
      triggerFetchPages,
    ],
  );

  return {
    forgetAppliedDeletionOfRecords,
    insertRowForCreatedRecord,
    removeRowsOfDeletedRecords,
  };
};
