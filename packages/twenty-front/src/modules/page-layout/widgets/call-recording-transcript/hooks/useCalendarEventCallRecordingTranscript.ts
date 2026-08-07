import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type CalendarEventCallRecordingTranscriptCandidate } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptCandidate';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { selectCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/utils/selectCalendarEventCallRecordingTranscript';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useEffect, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationGqlRecordFields,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Deliberate unpaginated selection window: an event has ~1 recording in
// practice, and paging until a readable transcript appears would allow an
// unbounded number of fetches on pathological data.
const CALL_RECORDING_TRANSCRIPT_QUERY_LIMIT = 50;

const CALL_RECORDING_TRANSCRIPT_PENDING_POLL_INTERVAL_MS = 30_000;

const CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS = {
  id: true,
  status: true,
  transcript: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_TRANSCRIPT_ORDER_BY: RecordGqlOperationOrderBy = [
  { createdAt: 'AscNullsLast' },
  { id: 'AscNullsFirst' },
];

const REQUIRED_CALL_RECORDING_FIELD_NAMES = [
  'status',
  'transcript',
  'createdAt',
];

export const useCalendarEventCallRecordingTranscript = (): {
  callRecordingTranscriptState: CalendarEventCallRecordingTranscriptWidgetState;
} => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const callRecordingObjectPermissions = useObjectPermissionsForObject(
    callRecordingObjectMetadataItem.id,
  );

  const calendarEventId =
    targetRecordIdentifier?.targetObjectNameSingular ===
    CoreObjectNameSingular.CalendarEvent
      ? targetRecordIdentifier.id
      : undefined;

  const requiredFieldMetadataItems = REQUIRED_CALL_RECORDING_FIELD_NAMES.map(
    (requiredFieldName) =>
      callRecordingObjectMetadataItem.fields.find(
        (field) => field.name === requiredFieldName,
      ),
  );

  const areRequiredFieldsDefined = requiredFieldMetadataItems.every(isDefined);

  const restrictedRequiredFieldNames = requiredFieldMetadataItems
    .filter(isDefined)
    .filter(
      (fieldMetadataItem) =>
        callRecordingObjectPermissions.restrictedFields[fieldMetadataItem.id]
          ?.canRead === false,
    )
    .map(
      (fieldMetadataItem) => fieldMetadataItem.label || fieldMetadataItem.name,
    );

  const hasCallRecordingTranscriptReadPermission =
    callRecordingObjectPermissions.canReadObjectRecords &&
    restrictedRequiredFieldNames.length === 0;

  const shouldSkipQuery =
    !isDefined(calendarEventId) ||
    !areRequiredFieldsDefined ||
    !hasCallRecordingTranscriptReadPermission;

  const {
    records: callRecordings,
    loading,
    error,
    refetch,
  } = useFindManyRecords<CalendarEventCallRecordingTranscriptCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    filter: isDefined(calendarEventId)
      ? { calendarEventId: { eq: calendarEventId } }
      : undefined,
    orderBy: CALL_RECORDING_TRANSCRIPT_ORDER_BY,
    recordGqlFields: CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS,
    limit: CALL_RECORDING_TRANSCRIPT_QUERY_LIMIT,
    skip: shouldSkipQuery,
  });

  const callRecordingTranscriptSelection = useMemo(
    () => selectCalendarEventCallRecordingTranscript(callRecordings),
    [callRecordings],
  );

  const getCallRecordingTranscriptState =
    (): CalendarEventCallRecordingTranscriptWidgetState => {
      if (!isDefined(calendarEventId)) {
        return { state: 'UNSUPPORTED' };
      }

      if (!areRequiredFieldsDefined) {
        return { state: 'UNAVAILABLE' };
      }

      if (!callRecordingObjectPermissions.canReadObjectRecords) {
        return {
          state: 'FORBIDDEN',
          restriction: {
            type: 'object',
            objectName: callRecordingObjectMetadataItem.labelSingular,
          },
        };
      }

      if (restrictedRequiredFieldNames.length > 0) {
        return {
          state: 'FORBIDDEN',
          restriction: {
            type: 'field',
            objectName: callRecordingObjectMetadataItem.labelSingular,
            fieldNames: restrictedRequiredFieldNames,
          },
        };
      }

      if (isDefined(error)) {
        return { state: 'QUERY_ERROR', error };
      }

      if (loading) {
        return { state: 'LOADING' };
      }

      return callRecordingTranscriptSelection;
    };

  const callRecordingTranscriptState = getCallRecordingTranscriptState();

  const isTranscriptPending = callRecordingTranscriptState.state === 'PENDING';

  // Transcript processing finishes minutes after the recording lands, so keep
  // refreshing while the selected recording is still pending.
  useEffect(() => {
    if (!isTranscriptPending) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refetch();
    }, CALL_RECORDING_TRANSCRIPT_PENDING_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isTranscriptPending, refetch]);

  return { callRecordingTranscriptState };
};
