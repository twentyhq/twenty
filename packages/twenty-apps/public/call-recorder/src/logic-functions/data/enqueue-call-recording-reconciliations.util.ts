import { enqueueJobs } from 'twenty-sdk/logic-function';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

// One job id per recording per recovery day, so an overlapping page or a
// re-run is deduplicated for as long as the queue still retains the first job.
export const enqueueCallRecordingReconciliations = async ({
  callRecordingIds,
  recoveryDate,
  delayMs,
}: {
  callRecordingIds: string[];
  recoveryDate: string;
  delayMs?: number;
}): Promise<void> => {
  for (const recordingIds of getBatches(
    callRecordingIds,
    MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL,
  )) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: recordingIds.map((callRecordingId) => ({
        jobId: `call-recorder-${callRecordingId}-reconcile-${recoveryDate}`,
        payload: { callRecordingId },
      })),
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs,
    });
  }
};
