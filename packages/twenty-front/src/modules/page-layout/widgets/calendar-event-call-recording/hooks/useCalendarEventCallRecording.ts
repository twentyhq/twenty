import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { selectCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/utils/selectCalendarEventCallRecording';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useCallback, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationGqlRecordFields,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CALL_RECORDING_QUERY_LIMIT = 50;

// mapObjectMetadataToGraphQLQuery drops unreadable and absent fields from the query
const CALL_RECORDING_RECORD_FIELDS = {
  id: true,
  status: true,
  transcript: true,
  summary: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_ORDER_BY: RecordGqlOperationOrderBy = [
  { createdAt: 'AscNullsLast' },
  { id: 'AscNullsFirst' },
];

export const useCalendarEventCallRecording = (): {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
  loading: boolean;
  error: Error | undefined;
} => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const calendarEventId =
    targetRecordIdentifier?.targetObjectNameSingular ===
    CoreObjectNameSingular.CalendarEvent
      ? targetRecordIdentifier.id
      : undefined;

  const shouldSkipQuery = !isDefined(calendarEventId);

  const callRecordingFilter = useMemo(
    () =>
      isDefined(calendarEventId)
        ? { calendarEventId: { eq: calendarEventId } }
        : undefined,
    [calendarEventId],
  );

  const {
    records: callRecordings,
    loading,
    error,
    refetch,
  } = useFindManyRecords<CalendarEventCallRecordingCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    filter: callRecordingFilter,
    orderBy: CALL_RECORDING_ORDER_BY,
    recordGqlFields: CALL_RECORDING_RECORD_FIELDS,
    limit: CALL_RECORDING_QUERY_LIMIT,
    skip: shouldSkipQuery,
  });

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
      variables: {
        filter: callRecordingFilter,
      },
    }),
    [callRecordingFilter],
  );

  const refetchCallRecordingOnSseReconnected = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useListenToEventsForQuery({
    queryId: `calendar-event-call-recording-${calendarEventId}`,
    operationSignature,
    skip: shouldSkipQuery,
    onSseReconnected: refetchCallRecordingOnSseReconnected,
  });

  const handleCallRecordingOperation = useCallback(() => {
    if (shouldSkipQuery) {
      return;
    }

    refetch();
  }, [shouldSkipQuery, refetch]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleCallRecordingOperation,
    objectMetadataItemId: callRecordingObjectMetadataItem.id,
  });

  const callRecording = useMemo(
    () => selectCalendarEventCallRecording(callRecordings),
    [callRecordings],
  );

  return { callRecording, loading, error };
};
