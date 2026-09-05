import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useGetShouldResetTableVirtualizationForUpdateInputs } from '@/object-record/record-table/virtualization/hooks/useGetShouldResetTableVirtualizationForUpdateInputs';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { getShouldResetTableVirtualizationForUpdateInputs } =
    useGetShouldResetTableVirtualizationForUpdateInputs();

  const debouncedResertVirtualizationBecauseDataChanged = useDebouncedCallback(
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

    const isUpdateOperation =
      objectRecordOperation.type === 'update-one' ||
      objectRecordOperation.type === 'update-many';

    if (isUpdateOperation) {
      const updateInputs =
        objectRecordOperation.type === 'update-one'
          ? [objectRecordOperation.result.updateInput]
          : objectRecordOperation.result.updateInputs;

      const shouldResetForUpdateOperation =
        getShouldResetTableVirtualizationForUpdateInputs(updateInputs);

      if (shouldResetForUpdateOperation) {
        debouncedResertVirtualizationBecauseDataChanged();
      }
    } else {
      debouncedResertVirtualizationBecauseDataChanged();
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  // A junction widget's rows come and go with junction records, which are
  // written on another object than the one the table lists.
  const junctionObjectMetadataId = useContext(RecordTableWidgetContext)
    ?.junctionCreateThrough?.junctionObjectMetadataId;

  const handleJunctionRecordOperation = () => {
    if (isDefined(junctionObjectMetadataId)) {
      debouncedResertVirtualizationBecauseDataChanged();
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleJunctionRecordOperation,
    objectMetadataItemId: junctionObjectMetadataId,
  });

  return <></>;
};
