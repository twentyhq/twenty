import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useGetRecordTableVirtualizationEffectForRecordOperation } from '@/object-record/record-table/virtualization/hooks/useGetRecordTableVirtualizationEffectForRecordOperation';
import { useGetShouldResetTableVirtualizationForUpdateInputs } from '@/object-record/record-table/virtualization/hooks/useGetShouldResetTableVirtualizationForUpdateInputs';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { type RecordTableVirtualizationEffect } from '@/object-record/record-table/virtualization/types/RecordTableVirtualizationEffect';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const {
    resetVirtualizationBecauseDataChanged,
    refreshTotalNumberOfRecordsToVirtualize,
  } = useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { getShouldResetTableVirtualizationForUpdateInputs } =
    useGetShouldResetTableVirtualizationForUpdateInputs();

  const { getEffectForCreatedRecord, getEffectForDeletedRecordIds } =
    useGetRecordTableVirtualizationEffectForRecordOperation();

  const debouncedResetVirtualizationBecauseDataChanged = useDebouncedCallback(
    resetVirtualizationBecauseDataChanged,
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    {
      leading: false,
    },
  );

  const debouncedRefreshTotalNumberOfRecordsToVirtualize = useDebouncedCallback(
    refreshTotalNumberOfRecordsToVirtualize,
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    {
      leading: false,
    },
  );

  const applyVirtualizationEffect = (
    virtualizationEffect: RecordTableVirtualizationEffect,
  ) => {
    if (virtualizationEffect === 'refresh-count') {
      debouncedRefreshTotalNumberOfRecordsToVirtualize();

      return;
    }

    debouncedResetVirtualizationBecauseDataChanged();
  };

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
        applyVirtualizationEffect(
          getEffectForCreatedRecord(objectRecordOperation.createdRecord),
        );

        return;
      }
      case 'delete-one': {
        applyVirtualizationEffect(
          getEffectForDeletedRecordIds([objectRecordOperation.deletedRecordId]),
        );

        return;
      }
      case 'delete-many': {
        applyVirtualizationEffect(
          getEffectForDeletedRecordIds(objectRecordOperation.deletedRecordIds),
        );

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
