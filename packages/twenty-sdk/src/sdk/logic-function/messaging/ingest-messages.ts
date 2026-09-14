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

// Writes messages into Twenty's Message/Message Thread records. Threading,
// de-duplication, channel association and per-message privacy are handled
// server-side; the whole batch lands in one transaction.
//
// At most 100 messages per call: one call is one transaction inside one
// logic-function timeout, so page a provider backfill rather than sending it
// whole.
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
