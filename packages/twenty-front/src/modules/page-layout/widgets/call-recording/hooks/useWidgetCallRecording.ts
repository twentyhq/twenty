import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { selectWidgetCallRecording } from '@/page-layout/widgets/call-recording/utils/selectWidgetCallRecording';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationGqlRecordFields,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CALL_RECORDING_QUERY_LIMIT = 50;

const CALL_RECORDING_SUMMARY_RECORD_FIELDS = {
  id: true,
  status: true,
  summary: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS = {
  id: true,
  status: true,
  transcript: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_TRANSCRIPT_WITH_VIDEO_RECORD_FIELDS = {
  ...CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS,
  video: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

const CALL_RECORDING_ORDER_BY: RecordGqlOperationOrderBy = [
  { createdAt: 'AscNullsLast' },
  { id: 'AscNullsFirst' },
];

type CallRecordingWidgetQueryScope =
  | 'call-recording-summary'
  | 'call-recording-transcript';

const REQUIRED_FIELD_NAMES_BY_QUERY_SCOPE: Record<
  CallRecordingWidgetQueryScope,
  string[]
> = {
  'call-recording-summary': ['status', 'summary', 'createdAt'],
  'call-recording-transcript': ['status', 'transcript', 'createdAt'],
};

const getCallRecordingRecordFields = ({
  queryScope,
  isVideoFieldRestricted,
}: {
  queryScope: CallRecordingWidgetQueryScope;
  isVideoFieldRestricted: boolean;
}): RecordGqlOperationGqlRecordFields => {
  if (queryScope === 'call-recording-summary') {
    return CALL_RECORDING_SUMMARY_RECORD_FIELDS;
  }

  if (isVideoFieldRestricted) {
    return CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS;
  }

  return CALL_RECORDING_TRANSCRIPT_WITH_VIDEO_RECORD_FIELDS;
};

export const useWidgetCallRecording = ({
  queryScope,
}: {
  queryScope: CallRecordingWidgetQueryScope;
}): {
  callRecording: WidgetCallRecordingCandidate | undefined;
  callRecordingsCount: number;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetch: () => Promise<unknown>;
} => {
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const targetKind = callRecordingWidgetTarget?.targetKind;
  const targetRecordId = callRecordingWidgetTarget?.recordId;

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const callRecordingObjectPermissions = useObjectPermissionsForObject(
    callRecordingObjectMetadataItem.id,
  );

  const isCallRecordingFieldRestricted = (fieldMetadataItem: { id: string }) =>
    callRecordingObjectPermissions.restrictedFields[fieldMetadataItem.id]
      ?.canRead === false;

  const requiredFieldMetadataItems = REQUIRED_FIELD_NAMES_BY_QUERY_SCOPE[
    queryScope
  ]
    .map((requiredFieldName) =>
      callRecordingObjectMetadataItem.fields.find(
        (fieldMetadataItem) => fieldMetadataItem.name === requiredFieldName,
      ),
    )
    .filter(isDefined);

  const restrictedFieldNames = requiredFieldMetadataItems
    .filter(isCallRecordingFieldRestricted)
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

  const shouldSkipQuery = !isDefined(targetRecordId) || isDefined(restriction);

  const videoFieldMetadataItem = callRecordingObjectMetadataItem.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === 'video',
  );

  const isVideoFieldRestricted =
    isDefined(videoFieldMetadataItem) &&
    isCallRecordingFieldRestricted(videoFieldMetadataItem);

  const callRecordingRecordFields = getCallRecordingRecordFields({
    queryScope,
    isVideoFieldRestricted,
  });

  const callRecordingFilter = useMemo(() => {
    if (!isDefined(targetRecordId)) {
      return undefined;
    }

    return targetKind === 'calendarEvent'
      ? { calendarEventId: { eq: targetRecordId } }
      : { id: { eq: targetRecordId } };
  }, [targetKind, targetRecordId]);

  const {
    records: callRecordings,
    totalCount: callRecordingsTotalCount,
    loading,
    error,
    refetch,
  } = useFindManyRecords<WidgetCallRecordingCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    filter: callRecordingFilter,
    orderBy: CALL_RECORDING_ORDER_BY,
    recordGqlFields: callRecordingRecordFields,
    limit: CALL_RECORDING_QUERY_LIMIT,
    withSoftDeleted: targetKind === 'callRecording',
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
    queryId: `${queryScope}-${targetRecordId}`,
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

  const callRecording = selectWidgetCallRecording(callRecordings);

  return {
    callRecording,
    callRecordingsCount: callRecordingsTotalCount ?? callRecordings.length,
    loading,
    error,
    restriction,
    refetch,
  };
};
