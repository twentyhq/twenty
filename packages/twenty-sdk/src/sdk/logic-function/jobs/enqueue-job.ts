import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  type EnqueueJobInput,
  type EnqueueJobResult,
} from 'twenty-shared/application';

export const enqueueJob = async (
  input: EnqueueJobInput,
): Promise<EnqueueJobResult> => {
  const client = new MetadataApiClient();

  const { enqueueJob: result } = await client.mutation({
    enqueueJob: {
      __args: { input },
      enqueued: true,
      logicFunctionUniversalIdentifier: true,
    },
  });

  return result;
};
