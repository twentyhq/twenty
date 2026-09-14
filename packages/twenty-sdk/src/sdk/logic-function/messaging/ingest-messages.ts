import { type MessageParticipantRole } from 'twenty-shared/types';

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

export type IngestMessageParticipant = {
  // 'FROM' marks the sender; exactly one participant must carry it. When its
  // handle equals the channel's, the message is recorded as outgoing.
  role: MessageParticipantRole;
  // The participant's identity on the provider, in the same namespace as the
  // channel's own handle.
  handle: string;
  displayName?: string;
  // Twenty resolves email participants to People by email address, which
  // cannot match a provider handle. Supply the record yourself when you know
  // it — look the handle up against `Person.linkedinLink` or an identity
  // field your app added. Without it the participant stays unlinked and the
  // thread never appears on anyone's record page.
  //
  // Ingesting the same message again with an identity you have since
  // resolved links the existing participant, so a late match is not lost.
  personId?: string;
  // For a participant who is a member of this workspace rather than a contact.
  workspaceMemberId?: string;
};

export type IngestMessage = {
  // The provider's id for this message. Ingesting it twice is a no-op, so
  // redelivered webhooks are safe to replay.
  externalId: string;
  // The provider's id for the conversation. Messages sharing one land in the
  // same Message Thread.
  threadExternalId: string;
  // Most non-email providers have none; the thread falls back to its
  // participants for a title.
  subject?: string;
  text: string;
  receivedAt: Date;
  participants: IngestMessageParticipant[];
};

export type IngestedMessage = {
  externalId: string;
  // Stable across re-ingestion, so it is safe to hang timeline activities or
  // your own records off it.
  messageId: string;
  messageThreadId: string;
};

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
