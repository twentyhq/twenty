import {
  type IngestMessage,
  type IngestedMessage,
} from '@/sdk/logic-function/messaging/types/ingest-message.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const INGEST_APP_MESSAGES_MUTATION = `
  mutation IngestAppMessages($input: IngestAppMessagesInput!) {
    ingestAppMessages(input: $input) {
      messages {
        externalId
        messageId
        messageThreadId
      }
    }
  }
`;

// At most 100 messages per call: one call is one transaction within one logic-function timeout
export const ingestMessages = async ({
  messageChannelId,
  messages,
}: {
  messageChannelId: string;
  messages: IngestMessage[];
}): Promise<IngestedMessage[]> => {
  const { ingestAppMessages } = await postGraphqlRequest<
    { input: { messageChannelId: string; messages: IngestMessage[] } },
    { ingestAppMessages: { messages: IngestedMessage[] } }
  >({
    query: INGEST_APP_MESSAGES_MUTATION,
    variables: { input: { messageChannelId, messages } },
    caller: 'ingestMessages',
  });

  return ingestAppMessages.messages;
};
