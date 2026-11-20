import { CoreApiClient } from 'twenty-client-sdk/core';
import { ingestMessages } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { type WhatsAppConversation } from 'src/logic-functions/types/whatsapp-conversation.type';

export const ingestSentWhatsAppMessage = async ({
  conversation: { messageChannel, personId, customerHandle, threadExternalId },
  messageId,
  text,
  campaignId,
}: {
  conversation: WhatsAppConversation;
  messageId: string;
  text: string;
  campaignId?: string;
}) => {
  const [ingestedMessage] = await ingestMessages({
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

  if (isDefined(campaignId) && isDefined(ingestedMessage)) {
    await new CoreApiClient().mutation({
      updateMessage: {
        __args: { id: ingestedMessage.messageId, data: { whatsAppCampaignId: campaignId } },
        id: true,
      },
    });
  }
};
