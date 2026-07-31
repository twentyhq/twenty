import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import { FIREFLIES_BACKFILL_PACING_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-pacing-milliseconds.constant';
import { FIREFLIES_CALL_RECORDING_FIELDS } from 'src/logic-functions/constants/fireflies-call-recording-fields.constant';
import { HTTP_TOO_MANY_REQUESTS_STATUS_CODE } from 'src/logic-functions/constants/http-too-many-requests-status-code.constant';
import { type CallRecordingFieldState } from 'src/logic-functions/types/call-recording-field-state.type';
import { type FirefliesSyncableField } from 'src/logic-functions/types/fireflies-syncable-field.type';
import { type ImportMissingFirefliesCallsResult } from 'src/logic-functions/types/import-missing-fireflies-calls-result.type';
import { type SyncFirefliesCallResult } from 'src/logic-functions/types/sync-fireflies-call-result.type';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';
import { isRetryableFirefliesApiStatus } from 'src/logic-functions/utils/is-retryable-fireflies-api-status.util';
import { syncFirefliesCallToCallRecording } from 'src/logic-functions/utils/sync-fireflies-call-to-call-recording.util';

type FirefliesCallSyncOutcome = 'imported' | 'errored' | 'skipped';

type SyncMissingFirefliesCallRecordingFieldsParams = {
  apiKey: string;
  coreApiClient: CoreApiClient;
  transcriptId: string;
  firefliesCallRecordingFields: FirefliesSyncableField[];
  callRecordingFieldState: CallRecordingFieldState | undefined;
  sleep: (milliseconds: number) => Promise<void>;
};

type SyncFirefliesTranscriptBatchParams = {
  apiKey: string;
  coreApiClient: CoreApiClient;
  transcriptIds: string[];
  callRecordingFieldStates: Map<string, CallRecordingFieldState>;
  sleep: (milliseconds: number) => Promise<void>;
};

const getMissingFirefliesCallRecordingFields = (
  callRecordingFieldState: CallRecordingFieldState | undefined,
): FirefliesSyncableField[] => {
  if (!isDefined(callRecordingFieldState)) {
    return FIREFLIES_CALL_RECORDING_FIELDS;
  }

  return FIREFLIES_CALL_RECORDING_FIELDS.filter(
    (firefliesCallRecordingField) =>
      (firefliesCallRecordingField === 'transcript' &&
        !callRecordingFieldState.isTranscriptFilled) ||
      (firefliesCallRecordingField === 'summary' &&
        !callRecordingFieldState.isSummaryFilled),
  );
};

const getFirefliesCallSyncOutcome = (
  firefliesFieldSyncResults: SyncFirefliesCallResult[],
): FirefliesCallSyncOutcome => {
  if (
    firefliesFieldSyncResults.some(
      (firefliesFieldSyncResult) => firefliesFieldSyncResult.status === 'error',
    )
  ) {
    return 'errored';
  }

  if (
    firefliesFieldSyncResults.some(
      (firefliesFieldSyncResult) =>
        firefliesFieldSyncResult.status === 'updated',
    )
  ) {
    return 'imported';
  }

  return 'skipped';
};

const syncMissingFirefliesCallRecordingFields = async ({
  apiKey,
  coreApiClient,
  transcriptId,
  firefliesCallRecordingFields,
  callRecordingFieldState,
  sleep,
}: SyncMissingFirefliesCallRecordingFieldsParams): Promise<
  FirefliesCallSyncOutcome | 'retryable-error'
> => {
  const firefliesFieldSyncResults: SyncFirefliesCallResult[] = [];

  for (const firefliesCallRecordingField of firefliesCallRecordingFields) {
    const isTranscriptFilled =
      (callRecordingFieldState?.isTranscriptFilled ?? false) ||
      firefliesFieldSyncResults.some(
        (firefliesFieldSyncResult) =>
          firefliesFieldSyncResult.status === 'updated' &&
          firefliesFieldSyncResult.field === 'transcript',
      );
    const isSummaryFilled =
      (callRecordingFieldState?.isSummaryFilled ?? false) ||
      firefliesFieldSyncResults.some(
        (firefliesFieldSyncResult) =>
          firefliesFieldSyncResult.status === 'updated' &&
          firefliesFieldSyncResult.field === 'summary',
      );
    const currentCallRecordingFieldState = {
      isTranscriptFilled,
      isSummaryFilled,
      status:
        firefliesFieldSyncResults.length === 0
          ? callRecordingFieldState?.status
          : isTranscriptFilled && isSummaryFilled
            ? CALL_RECORDING_STATUS.COMPLETED
            : CALL_RECORDING_STATUS.PROCESSING,
    };
    const firefliesFieldSyncResult = await syncFirefliesCallToCallRecording({
      apiKey,
      coreApiClient,
      transcriptId,
      field: firefliesCallRecordingField,
      callRecordingFieldState: currentCallRecordingFieldState,
    });

    if (
      firefliesFieldSyncResult.status === 'error' &&
      isDefined(firefliesFieldSyncResult.httpStatus) &&
      (firefliesFieldSyncResult.httpStatus ===
        HTTP_TOO_MANY_REQUESTS_STATUS_CODE ||
        isRetryableFirefliesApiStatus(firefliesFieldSyncResult.httpStatus))
    ) {
      return 'retryable-error';
    }

    firefliesFieldSyncResults.push(firefliesFieldSyncResult);

    await sleep(FIREFLIES_BACKFILL_PACING_MILLISECONDS);
  }

  return getFirefliesCallSyncOutcome(firefliesFieldSyncResults);
};

const countFirefliesCallSyncOutcomes = (
  firefliesCallSyncOutcomes: FirefliesCallSyncOutcome[],
) => ({
  importedCallCount: firefliesCallSyncOutcomes.filter(
    (firefliesCallSyncOutcome) => firefliesCallSyncOutcome === 'imported',
  ).length,
  erroredCallCount: firefliesCallSyncOutcomes.filter(
    (firefliesCallSyncOutcome) => firefliesCallSyncOutcome === 'errored',
  ).length,
  skippedCallCount: firefliesCallSyncOutcomes.filter(
    (firefliesCallSyncOutcome) => firefliesCallSyncOutcome === 'skipped',
  ).length,
});

export const syncFirefliesTranscriptBatch = async ({
  apiKey,
  coreApiClient,
  transcriptIds,
  callRecordingFieldStates,
  sleep,
}: SyncFirefliesTranscriptBatchParams): Promise<ImportMissingFirefliesCallsResult> => {
  const firefliesCallSyncOutcomes: FirefliesCallSyncOutcome[] = [];

  for (const transcriptId of transcriptIds) {
    const callRecordingId =
      computeCallRecordingIdForFirefliesMeeting(transcriptId);
    const callRecordingFieldState =
      callRecordingFieldStates.get(callRecordingId);
    const firefliesCallRecordingFields = getMissingFirefliesCallRecordingFields(
      callRecordingFieldState,
    );

    if (firefliesCallRecordingFields.length === 0) {
      firefliesCallSyncOutcomes.push('skipped');
      continue;
    }

    const firefliesCallSyncOutcome =
      await syncMissingFirefliesCallRecordingFields({
        apiKey,
        coreApiClient,
        transcriptId,
        firefliesCallRecordingFields,
        callRecordingFieldState,
        sleep,
      });

    if (firefliesCallSyncOutcome === 'retryable-error') {
      return {
        status: 'retryable-error',
        ...countFirefliesCallSyncOutcomes(firefliesCallSyncOutcomes),
      };
    }

    firefliesCallSyncOutcomes.push(firefliesCallSyncOutcome);
  }

  return {
    status: 'completed',
    ...countFirefliesCallSyncOutcomes(firefliesCallSyncOutcomes),
  };
};
