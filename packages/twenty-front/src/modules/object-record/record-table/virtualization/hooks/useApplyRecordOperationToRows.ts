import { useStore } from 'jotai';
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
import { getAppliedRecordOperationKey } from '@/object-record/record-table/virtualization/utils/getAppliedRecordOperationKey';
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

  const canShiftRows = () =>
    !isDefined(recordLimit) &&
    !store.get(hasAnySoftDeleteFilterOnViewCallbackState) &&
    store.get(numberOfPendingPageFetchesCallbackState) === 0;

  const markOperationAsApplied = (operationKey: string) =>
    store.set(appliedRecordOperationKeysCallbackState, (operationKeys) =>
      new Set(operationKeys).add(operationKey),
    );

  const insertRowForCreatedRecord = (createdRecord: ObjectRecord): boolean => {
    const operationKey = getAppliedRecordOperationKey({
      operationType: 'create',
      recordId: createdRecord.id,
    });

    if (store.get(appliedRecordOperationKeysCallbackState).has(operationKey)) {
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

    try {
      // false is not proof: unloaded relation values make the filter reject matching records
      if (
        !isRecordMatchingFilter({
          record: createdRecord,
          filter,
          objectMetadataItem,
          objectMetadataItems,
        })
      ) {
        return false;
      }
    } catch {
      return false;
    }

    const loadedRows: { rowIndex: number; position: number | null }[] = [];

    recordIds.forEach((recordId, rowIndex) => {
      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      if (isDefined(record)) {
        loadedRows.push({ rowIndex, position: record.position });
      }
    });

    const totalNumberOfRows = store.get(totalNumberOfRowsCallbackState) ?? 0;

    const rowIndexToInsert = getRowIndexToInsertRecord({
      loadedRows,
      position: createdRecord.position,
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
  };

  const removeRowsOfDeletedRecords = (deletedRecordIds: string[]): boolean => {
    const recordIdsCallbackState = recordIdsByGroupCallbackState(
      NO_RECORD_GROUP_FAMILY_KEY,
    );

    for (const deletedRecordId of deletedRecordIds) {
      const operationKey = getAppliedRecordOperationKey({
        operationType: 'delete',
        recordId: deletedRecordId,
      });

      if (
        store.get(appliedRecordOperationKeysCallbackState).has(operationKey)
      ) {
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
  };

  const forgetAppliedDeletionOfRecords = (recordIds: string[]) =>
    store.set(appliedRecordOperationKeysCallbackState, (operationKeys) => {
      const remainingOperationKeys = new Set(operationKeys);

      for (const recordId of recordIds) {
        remainingOperationKeys.delete(
          getAppliedRecordOperationKey({ operationType: 'delete', recordId }),
        );
      }

      return remainingOperationKeys;
    });

  return {
    forgetAppliedDeletionOfRecords,
    insertRowForCreatedRecord,
    removeRowsOfDeletedRecords,
  };
};
