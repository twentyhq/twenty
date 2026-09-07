import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useCallRecordingIdForWidget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingIdForWidget';
import { useCallRecordingWidgetRestriction } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetRestriction';
import { type CallRecordingWidgetKind } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetKind';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { useCallback } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationGqlRecordFields,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CALL_RECORDING_RECORD_FIELDS_BY_WIDGET_KIND = {
  summary: { id: true, status: true, summary: true },
  transcript: { id: true, status: true, transcript: true },
} as const satisfies Record<
  CallRecordingWidgetKind,
  RecordGqlOperationGqlRecordFields
>;

export const useCallRecordingForWidget = ({
  kind,
}: {
  kind: CallRecordingWidgetKind;
}): {
  callRecording: WidgetCallRecordingCandidate | undefined;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetchCallRecording: () => Promise<void>;
} => {
  const { restriction, isFieldRestricted } = useCallRecordingWidgetRestriction({
    requiredFieldNames: ['status', kind],
  });
  const shouldSkipQuery = isDefined(restriction);

  const {
    callRecordingId,
    targetKind,
    loading: callRecordingIdLoading,
    error: callRecordingIdError,
    refetchCallRecordingId,
  } = useCallRecordingIdForWidget({ skip: shouldSkipQuery });

  // The transcript widget plays the video, but requesting a field the role
  // cannot read fails the whole query.
  const recordGqlFields =
    kind === 'transcript' && !isFieldRestricted('video')
      ? CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS_WITH_VIDEO
      : CALL_RECORDING_RECORD_FIELDS_BY_WIDGET_KIND[kind];

  const {
    record: callRecording,
    loading: callRecordingLoading,
    error: callRecordingError,
    refetch: refetchCallRecordingRecord,
  } = useFindOneRecord<WidgetCallRecordingCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    objectRecordId: callRecordingId,
    recordGqlFields,
    withSoftDeleted: targetKind === 'callRecording',
    skip: shouldSkipQuery || !isDefined(callRecordingId),
  });

  const refetchCallRecording = useCallback(async () => {
    await Promise.all([
      refetchCallRecordingId(),
      isDefined(callRecordingId)
        ? refetchCallRecordingRecord()
        : Promise.resolve(),
    ]);
  }, [refetchCallRecordingRecord, refetchCallRecordingId, callRecordingId]);

  return {
    callRecording,
    loading: callRecordingIdLoading || callRecordingLoading,
    error: callRecordingIdError ?? callRecordingError,
    restriction,
    refetchCallRecording,
  };
};

// Selected between stable maps so the query hook's memoised fields do not
// change identity on every render.
const CALL_RECORDING_TRANSCRIPT_RECORD_FIELDS_WITH_VIDEO = {
  ...CALL_RECORDING_RECORD_FIELDS_BY_WIDGET_KIND.transcript,
  video: true,
};
