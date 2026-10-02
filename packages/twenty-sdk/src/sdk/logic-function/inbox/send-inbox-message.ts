import {
  type SendInboxMessageInput,
  type SendInboxMessageResult,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const SEND_INBOX_MESSAGE_MUTATION = `
  mutation SendInboxMessage($input: SendInboxMessageInput!) {
    sendInboxMessage(input: $input) {
      threadId
    }
  }
`;

export const sendInboxMessage = async (
  input: SendInboxMessageInput,
): Promise<SendInboxMessageResult> => {
  const { sendInboxMessage: result } = await postGraphqlRequest<
    { input: SendInboxMessageInput },
    { sendInboxMessage: SendInboxMessageResult }
  >({
    query: SEND_INBOX_MESSAGE_MUTATION,
    variables: { input },
    caller: 'sendInboxMessage',
  });

  return result;
};
