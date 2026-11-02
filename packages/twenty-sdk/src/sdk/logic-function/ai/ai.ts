import { type AgentResponseFormat, type AiRunScope } from 'twenty-shared/ai';
import {
  type GenerateResult,
  type RunAgentMessage,
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

export type GenerateInput = {
  // a string is sent as one user message
  input: string | RunAgentMessage[];
  instructions?: string | null;
  // the workspace default model when unset
  modelId?: string | null;
  responseFormat?: AgentResponseFormat | null;
  // no data tools when unset
  scope?: AiRunScope | null;
};

export const ai = {
  // runs as the function's caller, like the default clients; with no scope it gets no data tools, and a scope only narrows the caller
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
      isActingAsCaller: true,
    });

    return result;
  },
};
