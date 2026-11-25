import { createHash } from 'node:crypto';
import { enqueueJobs } from 'twenty-sdk/logic-function';

import { ENQUEUE_JOBS_MAX_BATCH_SIZE } from 'src/constants/enqueue-jobs-max-batch-size.constant';
import { chunkArray } from 'src/logic-functions/data/chunk-array.util';

// job ids allow only [\w.-] and 128 characters, so the key is hashed
const buildJobId = ({
  logicFunctionUniversalIdentifier,
  jobKey,
}: {
  logicFunctionUniversalIdentifier: string;
  jobKey: string;
}) =>
  createHash('sha256')
    .update(`${logicFunctionUniversalIdentifier}:${jobKey}`)
    .digest('hex');

// a job id that is already queued or done is not added again, which drops redelivered events
export const enqueueLogicFunctionJobs = async <
  TPayload extends Record<string, unknown>,
>({
  logicFunctionUniversalIdentifier,
  payloads,
  getJobKey,
}: {
  logicFunctionUniversalIdentifier: string;
  payloads: TPayload[];
  getJobKey: (payload: TPayload) => string;
}) => {
  const jobs = [
    ...new Map(
      payloads.map((payload) => {
        const jobId = buildJobId({
          logicFunctionUniversalIdentifier,
          jobKey: getJobKey(payload),
        });

        return [jobId, { jobId, payload }];
      }),
    ).values(),
  ];

  for (const batch of chunkArray(jobs, ENQUEUE_JOBS_MAX_BATCH_SIZE)) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      retryLimit: 3,
      jobs: batch,
    });
  }
};
