import {
  type EnqueueJobInput,
  type EnqueueJobResult,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const ENQUEUE_JOB_MUTATION = `
  mutation EnqueueJob($input: EnqueueJobInput!) {
    enqueueJob(input: $input) {
      enqueued
      logicFunctionUniversalIdentifier
    }
  }
`;

export const enqueueJob = async (
  input: EnqueueJobInput,
): Promise<EnqueueJobResult> => {
  const { enqueueJob: result } = await postGraphqlRequest<
    { input: EnqueueJobInput },
    { enqueueJob: EnqueueJobResult }
  >({
    query: ENQUEUE_JOB_MUTATION,
    variables: { input },
    caller: 'enqueueJob',
  });

  return result;
};
