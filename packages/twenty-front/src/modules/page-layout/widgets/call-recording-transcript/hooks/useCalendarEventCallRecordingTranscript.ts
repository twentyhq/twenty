import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type CalendarEventCallRecordingTranscriptCandidate } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptCandidate';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { selectCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/utils/selectCalendarEventCallRecordingTranscript';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
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

const REQUIRED_CALL_RECORDING_FIELD_NAMES = Object.keys(
  CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS,
).filter((fieldName) => fieldName !== 'id');

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

  const hasRequiredFieldReadPermission =
    REQUIRED_CALL_RECORDING_FIELD_NAMES.every((fieldName) => {
      const fieldMetadataItem = callRecordingObjectMetadataItem.fields.find(
        (field) => field.name === fieldName,
      );

      if (!isDefined(fieldMetadataItem)) {
        return false;
      }

      return (
        callRecordingObjectPermissions.restrictedFields[fieldMetadataItem.id]
          ?.canRead !== false
      );
    });

  const hasCallRecordingTranscriptReadPermission =
    callRecordingObjectPermissions.canReadObjectRecords &&
    hasRequiredFieldReadPermission;

  const shouldSkipQuery =
    !isDefined(calendarEventId) || !hasCallRecordingTranscriptReadPermission;

  const {
    records: callRecordings,
    loading,
    error,
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

  if (!isDefined(calendarEventId)) {
    return { callRecordingTranscriptState: { state: 'UNSUPPORTED' } };
  }

  if (!hasCallRecordingTranscriptReadPermission) {
    return { callRecordingTranscriptState: { state: 'FORBIDDEN' } };
  }

  if (isDefined(error)) {
    return { callRecordingTranscriptState: { state: 'QUERY_ERROR' } };
  }

  if (loading) {
    return { callRecordingTranscriptState: { state: 'LOADING' } };
  }

  return {
    callRecordingTranscriptState:
      selectCalendarEventCallRecordingTranscript(callRecordings),
  };
};
