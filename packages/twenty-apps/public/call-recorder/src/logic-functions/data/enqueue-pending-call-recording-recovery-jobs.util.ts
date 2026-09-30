import { enqueueJobs } from 'twenty-sdk/logic-function';

import { PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export const enqueuePendingCallRecordingRecoveryJobs = async ({
  callRecordingIds,
  recoveryDate,
}: {
  callRecordingIds: string[];
  recoveryDate: string;
}): Promise<void> => {
  const recoveryBatches = getBatches(
    callRecordingIds,
    Math.min(
      RECALL_RECOVERY_CALLS_PER_MINUTE,
      MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL,
    ),
  );

  for (const [batchIndex, batchCallRecordingIds] of recoveryBatches.entries()) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: batchCallRecordingIds.map((callRecordingId) => ({
        jobId: `call-recorder-${callRecordingId}-recover-pending-${recoveryDate}`,
        payload: { callRecordingId },
      })),
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: batchIndex * MILLISECONDS_PER_MINUTE,
    });
  }
};
