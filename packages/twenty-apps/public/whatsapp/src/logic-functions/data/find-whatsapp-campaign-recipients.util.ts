import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS } from 'src/constants/send-template-to-people-max-recipients.constant';
import { type WhatsAppCampaignRecipient } from 'src/logic-functions/types/whatsapp-campaign-recipient.type';

type CampaignMessageNode = {
  id: string;
  receivedAt: string | null;
  whatsAppStatus: string | null;
  whatsAppStatusError: string | null;
  messageParticipants: {
    edges: Array<{
      node: {
        role: string;
        handle: string | null;
        displayName: string | null;
        person: { name: { firstName: string | null; lastName: string | null } | null } | null;
      };
    }>;
  } | null;
};

// a reply is an incoming message stored after the campaign started, in the conversation of one of its messages
export const findWhatsAppCampaignRecipients = async ({
  client,
  campaignId,
  campaignCreatedAt,
}: {
  client: CoreApiClient;
  campaignId: string;
  campaignCreatedAt: string;
}): Promise<WhatsAppCampaignRecipient[]> => {
  const { messages } = await client.query({
    messages: {
      __args: { filter: { whatsAppCampaignId: { eq: campaignId } }, first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS },
      edges: {
        node: {
          id: true,
          receivedAt: true,
          whatsAppStatus: true,
          whatsAppStatusError: true,
          messageParticipants: {
            edges: {
              node: { role: true, handle: true, displayName: true, person: { name: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    },
  });
  const campaignMessages: CampaignMessageNode[] = (messages?.edges ?? []).map(
    ({ node }: { node: CampaignMessageNode }) => node,
  );

  if (campaignMessages.length === 0) {
    return [];
  }

  const { messageChannelMessageAssociations: campaignAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: { messageId: { in: campaignMessages.map(({ id }) => id) } },
        first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS,
      },
      edges: { node: { messageId: true, messageThreadExternalId: true } },
    },
  });
  const threadExternalIdByMessageId = new Map<string, string>(
    (campaignAssociations?.edges ?? []).flatMap(
      ({ node }: { node: { messageId: string; messageThreadExternalId: string | null } }) =>
        isNonEmptyString(node.messageThreadExternalId) ? [[node.messageId, node.messageThreadExternalId]] : [],
    ),
  );
  const threadExternalIds = [...new Set(threadExternalIdByMessageId.values())];

  const { messageChannelMessageAssociations: replyAssociations } =
    threadExternalIds.length > 0
      ? await client.query({
          messageChannelMessageAssociations: {
            __args: {
              filter: {
                messageThreadExternalId: { in: threadExternalIds },
                direction: { eq: 'INCOMING' },
                createdAt: { gt: campaignCreatedAt },
              },
              first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS,
            },
            edges: { node: { messageThreadExternalId: true } },
          },
        })
      : { messageChannelMessageAssociations: undefined };
  const repliedThreadExternalIds = new Set(
    (replyAssociations?.edges ?? []).map(
      ({ node }: { node: { messageThreadExternalId: string | null } }) => node.messageThreadExternalId,
    ),
  );

  return campaignMessages.map((message) => {
    const recipient = message.messageParticipants?.edges.find(({ node }) => node.role === 'TO')?.node;
    const personName = [recipient?.person?.name?.firstName, recipient?.person?.name?.lastName]
      .filter(isNonEmptyString)
      .join(' ');
    const threadExternalId = threadExternalIdByMessageId.get(message.id);

    return {
      messageId: message.id,
      recipientName: isNonEmptyString(personName) ? personName : (recipient?.displayName ?? null),
      recipientHandle: recipient?.handle ?? null,
      sentAt: message.receivedAt,
      status: message.whatsAppStatus,
      statusError: message.whatsAppStatusError,
      hasReplied: threadExternalId !== undefined && repliedThreadExternalIds.has(threadExternalId),
    };
  });
};
