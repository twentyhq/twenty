import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';

// The SDK's enqueueJobs sends the caller's token, so the jobs, and every job they enqueue, would run as that member.
export const enqueueJobsAsApplication = async (
  input: EnqueueJobsInput,
): Promise<void> => {
  await new MetadataApiClient({ runAs: 'application' }).mutation({
    enqueueJobs: { __args: { input }, enqueued: true },
  });
};
