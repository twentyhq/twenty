import {
  type GenerateInput,
  type GenerateResult,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const GENERATE_MUTATION = `
  mutation Generate($input: GenerateInput!) {
    generate(input: $input) {
      success
      text
      object
      error
      turnId
      usage {
        inputTokens
        outputTokens
      }
    }
  }
`;

export const ai = {
  // One model call, as the function's caller: no agent and no conversation. Without a scope the
  // call reads no records; a scope can only narrow what the caller may already reach
  generate: async ({
    input,
    ...rest
  }: GenerateInput): Promise<GenerateResult> => {
    const variables = {
      input: {
        ...rest,
        input:
          typeof input === 'string'
            ? [{ role: 'user', content: input }]
            : input,
      },
    };

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
