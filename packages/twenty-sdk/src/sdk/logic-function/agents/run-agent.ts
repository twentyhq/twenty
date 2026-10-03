import {
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const RUN_AGENT_MUTATION = `
  mutation RunAgent($input: RunAgentInput!) {
    runAgent(input: $input) {
      result
      error
      success
      threadId
    }
  }
`;

export const runAgent = async ({
  input,
  ...rest
}: RunAgentInput): Promise<RunAgentResult> => {
  const variables = {
    input: isDefined(input)
      ? {
          ...rest,
          input:
            typeof input === 'string'
              ? [{ role: 'user', content: input }]
              : input,
        }
      : rest,
  };

  const { runAgent: result } = await postGraphqlRequest<
    typeof variables,
    { runAgent: RunAgentResult }
  >({
    query: RUN_AGENT_MUTATION,
    variables,
    caller: 'runAgent',
  });

  return result;
};
