import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

// A junction widget's rows come and go with junction records, which are
// written on another object than the one the table lists.
export const RecordTableVirtualizedJunctionDataChangedEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const junctionCreateThrough = useContext(
    RecordTableWidgetContext,
  )?.junctionCreateThrough;

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const debouncedResetVirtualizationBecauseDataChanged = useDebouncedCallback(
    resetVirtualizationBecauseDataChanged,
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    {
      leading: false,
    },
  );

  const handleJunctionRecordOperation = ({
    operation,
  }: ObjectRecordOperationBrowserEventDetail) => {
    if (!isDefined(junctionCreateThrough)) {
      return;
    }

    // Only operations carrying the written record can be scoped to the
    // widget's source record; the others may concern it, so they refresh.
    const writtenRecord =
      operation.type === 'create-one'
        ? operation.createdRecord
        : operation.type === 'restore-one'
          ? operation.restoredRecord
          : undefined;

    if (
      isDefined(writtenRecord) &&
      writtenRecord[junctionCreateThrough.sourceJoinColumnName] !==
        junctionCreateThrough.sourceRecordId
    ) {
      return;
    }

    debouncedResetVirtualizationBecauseDataChanged();
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleJunctionRecordOperation,
    objectMetadataItemId: junctionCreateThrough?.junctionObjectMetadataId,
    enabled: isDefined(junctionCreateThrough),
  });

  return <></>;
};
