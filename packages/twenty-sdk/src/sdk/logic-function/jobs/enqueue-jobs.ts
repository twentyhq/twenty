import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  type EnqueueJobInput,
  type EnqueueJobResult,
} from 'twenty-shared/application';

export const enqueueJobs = async (
  jobs: EnqueueJobInput[],
): Promise<EnqueueJobResult[]> => {
  const client = new MetadataApiClient();

  const { enqueueJobs: result } = await client.mutation({
    enqueueJobs: {
      __args: { input: { jobs } },
      jobs: {
        enqueued: true,
        logicFunctionUniversalIdentifier: true,
      },
    },
  });

  return result.jobs;
};
