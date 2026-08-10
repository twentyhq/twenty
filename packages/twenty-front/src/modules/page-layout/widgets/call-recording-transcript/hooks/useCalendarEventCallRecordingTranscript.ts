import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type CalendarEventCallRecordingTranscriptCandidate } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptCandidate';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { selectCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/utils/selectCalendarEventCallRecordingTranscript';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationGqlRecordFields,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CALL_RECORDING_TRANSCRIPT_QUERY_LIMIT = 50;

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
  ).filter(isDefined);

  const hasRequiredFieldMetadata =
    requiredFieldMetadataItems.length ===
    REQUIRED_CALL_RECORDING_FIELD_NAMES.length;

  const restrictedFieldNames = requiredFieldMetadataItems
    .filter(
      (fieldMetadataItem) =>
        callRecordingObjectPermissions.restrictedFields[fieldMetadataItem.id]
          ?.canRead === false,
    )
    .map((fieldMetadataItem) =>
      isNonEmptyString(fieldMetadataItem.label)
        ? fieldMetadataItem.label
        : fieldMetadataItem.name,
    );

  const canReadCallRecordingObjectRecords =
    callRecordingObjectPermissions.canReadObjectRecords;

  const shouldSkipQuery =
    !isDefined(calendarEventId) ||
    !hasRequiredFieldMetadata ||
    !canReadCallRecordingObjectRecords ||
    restrictedFieldNames.length > 0;

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
  } = useFindManyRecords<CalendarEventCallRecordingTranscriptCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    filter: callRecordingFilter,
    orderBy: CALL_RECORDING_TRANSCRIPT_ORDER_BY,
    recordGqlFields: CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS,
    limit: CALL_RECORDING_TRANSCRIPT_QUERY_LIMIT,
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

  const refetchCallRecordingTranscriptOnSseReconnected =
    useCallback(async () => {
      await refetch();
    }, [refetch]);

  useListenToEventsForQuery({
    queryId: `call-recording-transcript-${calendarEventId}`,
    operationSignature,
    skip: shouldSkipQuery,
    onSseReconnected: refetchCallRecordingTranscriptOnSseReconnected,
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

  const callRecordingTranscriptSelection = useMemo(
    () => selectCalendarEventCallRecordingTranscript(callRecordings),
    [callRecordings],
  );

  if (!isDefined(calendarEventId)) {
    return { callRecordingTranscriptState: { state: 'UNSUPPORTED' } };
  }

  if (!hasRequiredFieldMetadata) {
    return { callRecordingTranscriptState: { state: 'UNAVAILABLE' } };
  }

  if (!canReadCallRecordingObjectRecords) {
    return {
      callRecordingTranscriptState: {
        state: 'FORBIDDEN',
        restriction: {
          type: 'object',
          objectName: callRecordingObjectMetadataItem.labelSingular,
        },
      },
    };
  }

  if (restrictedFieldNames.length > 0) {
    return {
      callRecordingTranscriptState: {
        state: 'FORBIDDEN',
        restriction: { type: 'field', fieldNames: restrictedFieldNames },
      },
    };
  }

  if (isDefined(error)) {
    return { callRecordingTranscriptState: { state: 'QUERY_ERROR', error } };
  }

  if (loading) {
    return { callRecordingTranscriptState: { state: 'LOADING' } };
  }

  return { callRecordingTranscriptState: callRecordingTranscriptSelection };
};
