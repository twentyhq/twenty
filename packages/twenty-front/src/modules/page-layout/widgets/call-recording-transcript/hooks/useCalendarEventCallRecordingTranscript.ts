import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { type CalendarEventCallRecordingTranscriptCandidate } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptCandidate';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { selectCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/utils/selectCalendarEventCallRecordingTranscript';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useEffect, useMemo, useState } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
  type RecordGqlOperationGqlRecordFields,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CALL_RECORDING_TRANSCRIPT_PAGE_SIZE = 50;

const CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS = {
  id: true,
  status: true,
  transcript: true,
  startedAt: true,
  endedAt: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_TRANSCRIPT_ORDER_BY: RecordGqlOperationOrderBy = [
  { endedAt: 'DescNullsLast' },
  { startedAt: 'DescNullsLast' },
  { createdAt: 'DescNullsLast' },
  { id: 'AscNullsFirst' },
];

const REQUIRED_CALL_RECORDING_FIELD_NAMES = [
  'status',
  'transcript',
  'startedAt',
  'endedAt',
  'createdAt',
] as const;

export const useCalendarEventCallRecordingTranscript = () => {
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

  const callRecordingFilter = useMemo<RecordGqlOperationFilter | undefined>(
    () =>
      isDefined(calendarEventId)
        ? { calendarEventId: { eq: calendarEventId } }
        : undefined,
    [calendarEventId],
  );

  const shouldSkipQuery =
    !isDefined(calendarEventId) || !hasCallRecordingTranscriptReadPermission;

  const {
    records: callRecordings,
    loading,
    error,
    fetchMoreRecords,
    hasNextPage,
    queryIdentifier,
  } = useFindManyRecords<CalendarEventCallRecordingTranscriptCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    filter: callRecordingFilter,
    orderBy: CALL_RECORDING_TRANSCRIPT_ORDER_BY,
    recordGqlFields: CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS,
    limit: CALL_RECORDING_TRANSCRIPT_PAGE_SIZE,
    skip: shouldSkipQuery,
  });

  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    queryIdentifier,
  );

  const [paginationErrorQueryIdentifier, setPaginationErrorQueryIdentifier] =
    useState<string>();

  const hasPaginationError = paginationErrorQueryIdentifier === queryIdentifier;

  useEffect(() => {
    if (
      shouldSkipQuery ||
      loading ||
      isDefined(error) ||
      !hasNextPage ||
      isFetchingMoreRecords ||
      hasPaginationError
    ) {
      return;
    }

    const fetchAdditionalPage = async () => {
      const fetchMoreResult = await fetchMoreRecords();

      if (isDefined(fetchMoreResult?.error)) {
        setPaginationErrorQueryIdentifier(queryIdentifier);
      }
    };

    void fetchAdditionalPage();
  }, [
    error,
    fetchMoreRecords,
    hasNextPage,
    hasPaginationError,
    isFetchingMoreRecords,
    loading,
    queryIdentifier,
    shouldSkipQuery,
  ]);

  const callRecordingTranscriptState =
    useMemo<CalendarEventCallRecordingTranscriptWidgetState>(() => {
      if (!isDefined(calendarEventId)) {
        return { state: 'UNSUPPORTED' };
      }

      if (!hasCallRecordingTranscriptReadPermission) {
        return { state: 'FORBIDDEN' };
      }

      if (isDefined(error) || hasPaginationError) {
        return { state: 'QUERY_ERROR' };
      }

      if (loading) {
        return { state: 'LOADING', loadingPhase: 'INITIAL' };
      }

      if (isFetchingMoreRecords || hasNextPage) {
        return { state: 'LOADING', loadingPhase: 'ADDITIONAL_PAGE' };
      }

      return selectCalendarEventCallRecordingTranscript(callRecordings);
    }, [
      calendarEventId,
      callRecordings,
      error,
      hasCallRecordingTranscriptReadPermission,
      hasNextPage,
      hasPaginationError,
      isFetchingMoreRecords,
      loading,
    ]);

  return { callRecordingTranscriptState };
};
