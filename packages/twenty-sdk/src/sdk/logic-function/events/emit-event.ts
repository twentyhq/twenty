import {
  type EmitEventInput,
  type EmitEventResult,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const EMIT_APP_EVENT_MUTATION = `
  mutation EmitAppEvent($input: EmitAppEventInput!) {
    emitAppEvent(input: $input) {
      id
      occurredAt
    }
  }
`;

export const emitEvent = async (
  input: EmitEventInput,
): Promise<EmitEventResult> => {
  const { emitAppEvent: result } = await postGraphqlRequest<
    { input: EmitEventInput },
    { emitAppEvent: EmitEventResult }
  >({
    query: EMIT_APP_EVENT_MUTATION,
    variables: { input },
    caller: 'emitEvent',
  });

  return result;
};
