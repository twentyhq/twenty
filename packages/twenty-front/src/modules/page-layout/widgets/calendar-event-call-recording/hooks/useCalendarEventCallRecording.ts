import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useCallRecordingSummaryFieldAccess } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCallRecordingSummaryFieldAccess';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { type CalendarEventCallRecordingWidgetState } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingWidgetState';
import { selectCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/utils/selectCalendarEventCallRecording';
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

const CALL_RECORDING_QUERY_LIMIT = 50;

const CALL_RECORDING_RECORD_FIELDS = {
  id: true,
  status: true,
  transcript: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_ORDER_BY: RecordGqlOperationOrderBy = [
  { createdAt: 'AscNullsLast' },
  { id: 'AscNullsFirst' },
];

const REQUIRED_CALL_RECORDING_FIELD_NAMES = [
  'status',
  'transcript',
  'createdAt',
];

export const useCalendarEventCallRecording = (): {
  callRecordingState: CalendarEventCallRecordingWidgetState;
} => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const callRecordingObjectPermissions = useObjectPermissionsForObject(
    callRecordingObjectMetadataItem.id,
  );

  const { isSummaryFieldMetadataMissing, restrictedSummaryFieldLabel } =
    useCallRecordingSummaryFieldAccess();

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

  const shouldQuerySummaryField =
    !isSummaryFieldMetadataMissing && !isDefined(restrictedSummaryFieldLabel);

  const recordGqlFields = useMemo(
    () =>
      shouldQuerySummaryField
        ? { ...CALL_RECORDING_RECORD_FIELDS, summary: true }
        : CALL_RECORDING_RECORD_FIELDS,
    [shouldQuerySummaryField],
  );

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
    recordGqlFields,
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

  const callRecordingSelection = useMemo(
    () => selectCalendarEventCallRecording(callRecordings),
    [callRecordings],
  );

  if (!isDefined(calendarEventId)) {
    return { callRecordingState: { state: 'UNSUPPORTED' } };
  }

  if (!hasRequiredFieldMetadata) {
    return { callRecordingState: { state: 'UNAVAILABLE' } };
  }

  if (!canReadCallRecordingObjectRecords) {
    return {
      callRecordingState: {
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
      callRecordingState: {
        state: 'FORBIDDEN',
        restriction: { type: 'field', fieldNames: restrictedFieldNames },
      },
    };
  }

  if (isDefined(error)) {
    return { callRecordingState: { state: 'QUERY_ERROR', error } };
  }

  if (loading) {
    return { callRecordingState: { state: 'LOADING' } };
  }

  return { callRecordingState: callRecordingSelection };
};
