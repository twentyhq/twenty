import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useCallRecordingIdForWidget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingIdForWidget';
import { useCallRecordingWidgetRestriction } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetRestriction';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { useCallback } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationGqlRecordFields,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CALL_RECORDING_SUMMARY_RECORD_FIELDS = {
  id: true,
  status: true,
  summary: true,
  createdAt: true,
} as const satisfies RecordGqlOperationGqlRecordFields;

export const useCallRecordingForSummary = (): {
  callRecording: WidgetCallRecordingCandidate | undefined;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetch: () => Promise<unknown>;
} => {
  const { restriction } = useCallRecordingWidgetRestriction({
    requiredFieldNames: ['status', 'summary', 'createdAt'],
  });
  const shouldSkipQuery = isDefined(restriction);

  const {
    callRecordingId,
    targetKind,
    loading: callRecordingIdLoading,
    error: callRecordingIdError,
    refetch: refetchCallRecordingId,
  } = useCallRecordingIdForWidget({ skip: shouldSkipQuery });

  const {
    record: callRecording,
    loading: callRecordingLoading,
    error: callRecordingError,
    refetch: refetchCallRecording,
  } = useFindOneRecord<WidgetCallRecordingCandidate>({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    objectRecordId: callRecordingId,
    recordGqlFields: CALL_RECORDING_SUMMARY_RECORD_FIELDS,
    withSoftDeleted: targetKind === 'callRecording',
    skip: shouldSkipQuery || !isDefined(callRecordingId),
  });

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchCallRecordingId(),
      isDefined(callRecordingId) ? refetchCallRecording() : Promise.resolve(),
    ]);
  }, [refetchCallRecording, refetchCallRecordingId, callRecordingId]);

  return {
    callRecording,
    loading: callRecordingIdLoading || callRecordingLoading,
    error: callRecordingIdError ?? callRecordingError,
    restriction,
    refetch,
  };
};
