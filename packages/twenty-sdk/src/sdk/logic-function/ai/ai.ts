import {
  type GenerateInput,
  type GenerateResult,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';
import { toRunAgentMessages } from '@/sdk/logic-function/utils/to-run-agent-messages.util';

const GENERATE_MUTATION = `
  mutation Generate($input: GenerateInput!) {
    generate(input: $input) {
      success
      text
      object
      error
      runId
      usage {
        inputTokens
        outputTokens
      }
    }
  }
`;

export const ai = {
  // sent with the application's token, so it acts as the application; with no scope it gets no data tools
  generate: async ({
    input,
    ...rest
  }: GenerateInput): Promise<GenerateResult> => {
    const variables = { input: { ...rest, input: toRunAgentMessages(input) } };

    const { generate: result } = await postGraphqlRequest<
      typeof variables,
      { generate: GenerateResult }
    >({
      query: GENERATE_MUTATION,
      variables,
      caller: 'ai.generate',
    });

    return result;
  },
};
