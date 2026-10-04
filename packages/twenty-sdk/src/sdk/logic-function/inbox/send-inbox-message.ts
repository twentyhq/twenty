import { type SendInboxMessageResult } from 'twenty-shared/application';

import { type SendInboxMessageInput } from '@/sdk/define/common/types/loose-shared-types.type';
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
