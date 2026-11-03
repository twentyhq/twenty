import {
  type CreateVisitorEventTokenInput,
  type CreateVisitorEventTokenResult,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const CREATE_APP_VISITOR_EVENT_TOKEN_MUTATION = `
  mutation CreateAppVisitorEventToken($input: CreateAppVisitorEventTokenInput!) {
    createAppVisitorEventToken(input: $input) {
      token
      expiresAt
    }
  }
`;

export const createVisitorEventToken = async (
  input: CreateVisitorEventTokenInput,
): Promise<CreateVisitorEventTokenResult> => {
  const { createAppVisitorEventToken: result } = await postGraphqlRequest<
    { input: CreateVisitorEventTokenInput },
    { createAppVisitorEventToken: CreateVisitorEventTokenResult }
  >({
    query: CREATE_APP_VISITOR_EVENT_TOKEN_MUTATION,
    variables: { input },
    caller: 'createVisitorEventToken',
  });

  return result;
};
