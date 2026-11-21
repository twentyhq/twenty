import { type IngestMessage } from 'twenty-sdk/logic-function';

import { type ConversationsApiMessage } from 'src/logic-functions/types/conversations-api.type';

export const buildBackfillIngestMessages = ({
  pageId,
  customerId,
  customerPersonId,
  messages,
}: {
  pageId: string;
  customerId: string;
  customerPersonId: string;
  messages: ConversationsApiMessage[];
}): IngestMessage[] => {
  const pageParticipant = { handle: pageId };
  const customerParticipant = { handle: customerId, personId: customerPersonId };

  return messages.map((message) => {
    const isSentByPage = message.from.id === pageId;

    return {
      externalId: message.id,
      threadExternalId: customerId,
      text: message.message ?? '',
      receivedAt: new Date(message.created_time),
      participants: isSentByPage
        ? [
            { role: 'FROM', ...pageParticipant },
            { role: 'TO', ...customerParticipant },
          ]
        : [
            { role: 'FROM', ...customerParticipant },
            { role: 'TO', ...pageParticipant },
          ],
    };
  });
};
