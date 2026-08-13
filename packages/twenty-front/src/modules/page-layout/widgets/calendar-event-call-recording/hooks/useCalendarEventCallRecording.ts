import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { selectCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/utils/selectCalendarEventCallRecording';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
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
  summary: true,
  video: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_ORDER_BY: RecordGqlOperationOrderBy = [
  { createdAt: 'AscNullsLast' },
  { id: 'AscNullsFirst' },
];

type CalendarEventCallRecordingQueryScope =
  | 'call-recording-summary'
  | 'call-recording-transcript';

const REQUIRED_FIELD_NAMES_BY_QUERY_SCOPE: Record<
  CalendarEventCallRecordingQueryScope,
  string[]
> = {
  'call-recording-summary': ['status', 'summary', 'createdAt'],
  'call-recording-transcript': ['status', 'transcript', 'video', 'createdAt'],
};

export const useCalendarEventCallRecording = ({
  queryScope,
}: {
  queryScope: CalendarEventCallRecordingQueryScope;
}): {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
  callRecordingsCount: number;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetch: () => Promise<unknown>;
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

  const requiredFieldMetadataItems = REQUIRED_FIELD_NAMES_BY_QUERY_SCOPE[
    queryScope
  ]
    .map((requiredFieldName) =>
      callRecordingObjectMetadataItem.fields.find(
        (field) => field.name === requiredFieldName,
      ),
    )
    .filter(isDefined);

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

  const objectRestriction: WidgetAccessDenialInfo | undefined =
    callRecordingObjectPermissions.canReadObjectRecords
      ? undefined
      : {
          type: 'object',
          objectName: callRecordingObjectMetadataItem.labelSingular,
        };

  const fieldRestriction: WidgetAccessDenialInfo | undefined =
    restrictedFieldNames.length > 0
      ? { type: 'field', fieldNames: restrictedFieldNames }
      : undefined;

  const restriction = objectRestriction ?? fieldRestriction;

  const shouldSkipQuery = !isDefined(calendarEventId) || isDefined(restriction);

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
    queryId: `${queryScope}-${calendarEventId}`,
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

  const callRecording = selectCalendarEventCallRecording(callRecordings);

  return {
    callRecording,
    callRecordingsCount: callRecordings.length,
    loading,
    error,
    restriction,
    refetch,
  };
};
