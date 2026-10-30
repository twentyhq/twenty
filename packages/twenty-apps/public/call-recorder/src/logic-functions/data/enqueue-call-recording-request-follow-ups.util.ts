import { enqueueJobs } from 'twenty-sdk/logic-function';

import { FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CALL_RECORDING_REQUEST_FOLLOW_UP_DELAY_MS } from 'src/logic-functions/constants/call-recording-request-follow-up-delay-ms';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';
import { buildCallRecordingRequestFollowUpJobId } from 'src/logic-functions/domain/build-call-recording-request-follow-up-job-id.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

export const enqueueCallRecordingRequestFollowUps = async ({
  callRecordingIds,
  dueAt,
  attempt = 0,
}: {
  callRecordingIds: string[];
  dueAt?: Date;
  attempt?: number;
}): Promise<void> => {
  const now = Date.now();
  // Bucket the intended due time: enqueue latency must not split one due time across job ids.
  const firstSlotDueAt =
    dueAt ?? new Date(now + CALL_RECORDING_REQUEST_FOLLOW_UP_DELAY_MS);
  const delayMs = Math.max(0, firstSlotDueAt.getTime() - now);
  const followUpSlots = getBatches(
    getUniqueSortedIds(callRecordingIds),
    RECALL_RECOVERY_CALLS_PER_MINUTE,
  );

  for (const [slotIndex, slotCallRecordingIds] of followUpSlots.entries()) {
    const slotDelayMs = delayMs + slotIndex * MILLISECONDS_PER_MINUTE;

    try {
      await enqueueJobs({
        logicFunctionUniversalIdentifier:
          FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs: slotCallRecordingIds.map((callRecordingId) => ({
          jobId: buildCallRecordingRequestFollowUpJobId({
            callRecordingId,
            attempt,
            dueAt: firstSlotDueAt,
          }),
          payload: { callRecordingId, attempt },
        })),
        retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
        delayMs: slotDelayMs,
      });
    } catch (error) {
      throw buildRetryableStepFailure(
        'call recording follow-up enqueueing',
        error,
      );
    }
  }
};
