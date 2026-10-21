import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useGetShouldResetTableVirtualizationForUpdateInputs } from '@/object-record/record-table/virtualization/hooks/useGetShouldResetTableVirtualizationForUpdateInputs';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useApplyRecordOperationToRows } from '@/object-record/record-table/virtualization/hooks/useApplyRecordOperationToRows';

export const RecordTableVirtualizedDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { getShouldResetTableVirtualizationForUpdateInputs } =
    useGetShouldResetTableVirtualizationForUpdateInputs();

  const {
    forgetAppliedDeletionOfRecords,
    insertRowForCreatedRecord,
    removeRowsOfDeletedRecords,
  } = useApplyRecordOperationToRows();

  const debouncedResetVirtualizationBecauseDataChanged = useDebouncedCallback(
    resetVirtualizationBecauseDataChanged,
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    { leading: false },
  );

  const handleObjectRecordOperation = (
    objectRecordOperationEventDetail: ObjectRecordOperationBrowserEventDetail,
  ) => {
    const objectRecordOperation = objectRecordOperationEventDetail.operation;

    switch (objectRecordOperation.type) {
      case 'update-one':
      case 'update-many': {
        const updateInputs =
          objectRecordOperation.type === 'update-one'
            ? [objectRecordOperation.result.updateInput]
            : objectRecordOperation.result.updateInputs;

        if (getShouldResetTableVirtualizationForUpdateInputs(updateInputs)) {
          debouncedResetVirtualizationBecauseDataChanged();
        }

        return;
      }
      case 'create-one': {
        if (!insertRowForCreatedRecord(objectRecordOperation.createdRecord)) {
          debouncedResetVirtualizationBecauseDataChanged();
        }

        return;
      }
      case 'delete-one':
      case 'delete-many': {
        const deletedRecordIds =
          objectRecordOperation.type === 'delete-one'
            ? [objectRecordOperation.deletedRecordId]
            : objectRecordOperation.deletedRecordIds;

        if (!removeRowsOfDeletedRecords(deletedRecordIds)) {
          debouncedResetVirtualizationBecauseDataChanged();
        }

        return;
      }
      case 'restore-one':
      case 'restore-many': {
        const restoredRecords =
          objectRecordOperation.type === 'restore-one'
            ? [objectRecordOperation.restoredRecord]
            : objectRecordOperation.restoredRecords;

        forgetAppliedDeletionOfRecords(
          restoredRecords.map((record) => record.id),
        );
        debouncedResetVirtualizationBecauseDataChanged();

        return;
      }
      default: {
        debouncedResetVirtualizationBecauseDataChanged();
      }
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return <></>;
};
