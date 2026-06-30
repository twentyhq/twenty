import {
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const RUN_AGENT_MUTATION = `
  mutation RunAgent($input: RunAgentInput!) {
    runAgent(input: $input) {
      result
      error
      success
    }
  }
`;

export const runAgent = async (
  input: RunAgentInput,
): Promise<RunAgentResult> => {
  const { runAgent: result } = await postGraphqlRequest<
    { input: RunAgentInput },
    { runAgent: RunAgentResult }
  >({
    query: RUN_AGENT_MUTATION,
    variables: { input },
    caller: 'runAgent',
  });

  return result;
};
