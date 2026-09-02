import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { type JobStatusResult } from 'twenty-shared/application';

export const getJobStatus = async (jobId: string): Promise<JobStatusResult> => {
  const client = new MetadataApiClient();

  const { jobStatus: result } = await client.query({
    jobStatus: {
      __args: { jobId },
      jobId: true,
      state: true,
      attemptsMade: true,
      failedReason: true,
      enqueuedAt: true,
      startedAt: true,
      finishedAt: true,
    },
  });

  return result;
};
