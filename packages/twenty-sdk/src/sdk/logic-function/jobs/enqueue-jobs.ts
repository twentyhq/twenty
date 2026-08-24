import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  type EnqueueJobsInput,
  type EnqueueJobsResult,
} from 'twenty-shared/application';

export const enqueueJobs = async (
  input: EnqueueJobsInput,
): Promise<EnqueueJobsResult> => {
  const client = new MetadataApiClient();

  const { enqueueJobs: result } = await client.mutation({
    enqueueJobs: {
      __args: { input },
      enqueued: true,
      logicFunctionUniversalIdentifier: true,
      enqueuedJobsCount: true,
    },
  });

  return result;
};
