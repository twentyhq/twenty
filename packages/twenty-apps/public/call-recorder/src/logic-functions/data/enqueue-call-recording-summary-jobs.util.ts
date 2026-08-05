import { enqueueJob } from 'twenty-sdk/logic-function';

import { GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-job-logic-function-universal-identifier';
import { ENQUEUE_MAX_DELAY_MILLISECONDS } from 'src/logic-functions/constants/enqueue-max-delay-milliseconds';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { SUMMARY_JOB_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/summary-job-stagger-milliseconds';

export type EnqueueCallRecordingSummaryJobsResult = {
  enqueuedJobCount: number;
};

export const enqueueCallRecordingSummaryJobs = async ({
  callRecordingIds,
}: {
  callRecordingIds: string[];
}): Promise<EnqueueCallRecordingSummaryJobsResult> => {
  for (const [jobIndex, callRecordingId] of callRecordingIds.entries()) {
    try {
      await enqueueJob({
        logicFunctionUniversalIdentifier:
          GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payload: { callRecordingId },
        retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
        delayMs: Math.min(
          jobIndex * SUMMARY_JOB_STAGGER_MILLISECONDS,
          ENQUEUE_MAX_DELAY_MILLISECONDS,
        ),
      });
    } catch (error) {
      throw Object.assign(
        new Error(
          `call recording summary generation enqueued ${jobIndex} of ${callRecordingIds.length} jobs before enqueue failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
        { cause: error },
      );
    }
  }

  return { enqueuedJobCount: callRecordingIds.length };
};
