import { createHash } from 'node:crypto';
import { enqueueJobs } from 'twenty-sdk/logic-function';
import { ENQUEUE_JOBS_MAX_BATCH_SIZE } from 'src/constants/enqueue-jobs-max-batch-size.constant';

// job ids allow only [\w.-] and 128 characters, so the key is hashed
const buildJobId = ({ logicFunctionUniversalIdentifier, jobKey }: { logicFunctionUniversalIdentifier: string; jobKey: string }) =>
  createHash('sha256').update(`${logicFunctionUniversalIdentifier}:${jobKey}`).digest('hex');

// the job key collapses duplicate deliveries: a job id that is already queued or done is not added again
export const enqueueLogicFunctionJobs = async <TPayload extends Record<string, unknown>>({
  logicFunctionUniversalIdentifier,
  payloads,
  getJobKey,
  delayMs = 500,
}: {
  logicFunctionUniversalIdentifier: string;
  payloads: TPayload[];
  getJobKey: (payload: TPayload) => string;
  delayMs?: number;
}) => {
  const jobs = [
    ...new Map(
      payloads.map((payload) => {
        const jobId = buildJobId({ logicFunctionUniversalIdentifier, jobKey: getJobKey(payload) });

        return [jobId, { jobId, payload }];
      }),
    ).values(),
  ];

  for (let start = 0; start < jobs.length; start += ENQUEUE_JOBS_MAX_BATCH_SIZE) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      retryLimit: 3,
      delayMs,
      jobs: jobs.slice(start, start + ENQUEUE_JOBS_MAX_BATCH_SIZE),
    });
  }
};
