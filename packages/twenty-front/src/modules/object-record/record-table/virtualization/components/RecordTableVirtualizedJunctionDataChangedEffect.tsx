import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useListenToJunctionRecordOperation } from '@/object-record/record-table-widget/hooks/useListenToJunctionRecordOperation';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedJunctionDataChangedEffect = () => {
  const { objectNameSingular, objectMetadataItem } =
    useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();

  const reloadTable = useCallback(async () => {
    await Promise.all([
      resetVirtualizationBecauseDataChanged(),
      refetchAggregateQueriesForObjectMetadataItem({ objectMetadataItem }),
    ]);
  }, [
    objectMetadataItem,
    refetchAggregateQueriesForObjectMetadataItem,
    resetVirtualizationBecauseDataChanged,
  ]);

  const debouncedReloadTable = useDebouncedCallback(
    reloadTable,
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    {
      leading: false,
    },
  );

  useListenToJunctionRecordOperation({
    onJunctionRecordOperation: debouncedReloadTable,
  });

  return <></>;
};
