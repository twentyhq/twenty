import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { useListenToJunctionRecordOperation } from '@/object-record/record-table-widget/hooks/useListenToJunctionRecordOperation';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useDebouncedCallback } from 'use-debounce';

// Grouped tables are not virtualized: their rows come from the group query,
// which the junction write does not touch, so the query is refetched.
export const RecordTableRecordGroupJunctionDataChangedEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { refetch } = useRecordIndexTableQuery(objectNameSingular);

  const debouncedRefetch = useDebouncedCallback(
    () => {
      refetch();
    },
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    {
      leading: false,
    },
  );

  useListenToJunctionRecordOperation({
    onJunctionRecordOperation: debouncedRefetch,
  });

  return <></>;
};
