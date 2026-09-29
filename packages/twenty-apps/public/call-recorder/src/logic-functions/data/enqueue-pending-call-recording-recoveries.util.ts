import { enqueueJobs } from 'twenty-sdk/logic-function';

import { PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export const enqueuePendingCallRecordingRecoveries = async ({
  callRecordingIds,
  recoveryDate,
  delayMs,
}: {
  callRecordingIds: string[];
  recoveryDate: string;
  delayMs: number;
}): Promise<void> => {
  for (const recordingIds of getBatches(
    callRecordingIds,
    MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL,
  )) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: recordingIds.map((callRecordingId) => ({
        jobId: `call-recorder-${callRecordingId}-recover-pending-${recoveryDate}`,
        payload: { callRecordingId },
      })),
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs,
    });
  }
};
