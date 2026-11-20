import { ingestMessages } from 'twenty-sdk/logic-function';
import { type WhatsAppConversation } from 'src/logic-functions/types/whatsapp-conversation.type';

export const ingestSentWhatsAppMessage = async ({
  conversation: { messageChannel, personId, customerHandle, threadExternalId },
  messageId,
  text,
}: {
  conversation: WhatsAppConversation;
  messageId: string;
  text: string;
}) => {
  await ingestMessages({
    messageChannelId: messageChannel.id,
    messages: [
      {
        externalId: messageId,
        threadExternalId,
        text,
        receivedAt: new Date(),
        participants: [
          // Twenty marks a message outgoing only when its sender handle is exactly the channel handle
          { role: 'FROM', handle: messageChannel.handle },
          { role: 'TO', handle: customerHandle, personId },
        ],
      },
    ],
  });
};
