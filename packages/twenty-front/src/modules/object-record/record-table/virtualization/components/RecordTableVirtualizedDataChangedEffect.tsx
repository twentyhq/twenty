import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useSyncVirtualRowsWithRecordOperation } from '@/object-record/record-table/virtualization/hooks/useSyncVirtualRowsWithRecordOperation';
import { useGetShouldResetTableVirtualizationForUpdateInputs } from '@/object-record/record-table/virtualization/hooks/useGetShouldResetTableVirtualizationForUpdateInputs';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { getShouldResetTableVirtualizationForUpdateInputs } =
    useGetShouldResetTableVirtualizationForUpdateInputs();

  const {
    syncVirtualRowsWithCreatedRecord,
    syncVirtualRowsWithDeletedRecords,
  } = useSyncVirtualRowsWithRecordOperation();

  const debouncedResetVirtualizationBecauseDataChanged = useDebouncedCallback(
    resetVirtualizationBecauseDataChanged,
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    {
      leading: false,
    },
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
        if (
          !syncVirtualRowsWithCreatedRecord(objectRecordOperation.createdRecord)
        ) {
          debouncedResetVirtualizationBecauseDataChanged();
        }

        return;
      }
      case 'delete-one': {
        if (
          !syncVirtualRowsWithDeletedRecords([
            objectRecordOperation.deletedRecordId,
          ])
        ) {
          debouncedResetVirtualizationBecauseDataChanged();
        }

        return;
      }
      case 'delete-many': {
        if (
          !syncVirtualRowsWithDeletedRecords(
            objectRecordOperation.deletedRecordIds,
          )
        ) {
          debouncedResetVirtualizationBecauseDataChanged();
        }

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
