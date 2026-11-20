import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { listMessageChannels } from 'twenty-sdk/logic-function';
import { type WhatsAppConversationMessage } from 'src/logic-functions/types/whatsapp-conversation-message.type';

const PARTICIPATIONS_LIMIT = 200;

type AssociationNode = {
  direction: 'INCOMING' | 'OUTGOING';
  message: { text: string | null; receivedAt: string | null; whatsAppStatus: string | null } | null;
};

// the person's latest WhatsApp messages across every WhatsApp channel, oldest first
export const findPersonWhatsAppConversation = async ({
  personId,
  limit,
}: {
  personId: string;
  limit: number;
}): Promise<WhatsAppConversationMessage[]> => {
  const client = new CoreApiClient();
  const { messageParticipants } = await client.query({
    messageParticipants: {
      __args: { filter: { personId: { eq: personId } }, first: PARTICIPATIONS_LIMIT },
      edges: { node: { messageId: true } },
    },
  });
  const messageIds: string[] = (messageParticipants?.edges ?? [])
    .map(({ node }: { node: { messageId: string | null } }) => node.messageId)
    .filter(isNonEmptyString);
  const whatsAppChannelIds = (await listMessageChannels()).map(({ id }) => id);

  if (messageIds.length === 0 || whatsAppChannelIds.length === 0) {
    return [];
  }

  const { messageChannelMessageAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: { messageId: { in: [...new Set(messageIds)] }, messageChannelId: { in: whatsAppChannelIds } },
        first: PARTICIPATIONS_LIMIT,
      },
      edges: { node: { direction: true, message: { text: true, receivedAt: true, whatsAppStatus: true } } },
    },
  });

  return (messageChannelMessageAssociations?.edges ?? [])
    .map(({ node }: { node: AssociationNode }) => ({
      sentAt: node.message?.receivedAt ?? null,
      direction: node.direction,
      text: node.message?.text ?? '',
      status: node.message?.whatsAppStatus ?? null,
    }))
    .sort((first: WhatsAppConversationMessage, second: WhatsAppConversationMessage) =>
      (first.sentAt ?? '').localeCompare(second.sentAt ?? ''),
    )
    .slice(-limit);
};
