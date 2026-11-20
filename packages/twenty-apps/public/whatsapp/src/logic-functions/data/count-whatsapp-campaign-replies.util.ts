import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS } from 'src/constants/send-template-to-people-max-recipients.constant';

// a reply is an incoming message stored after the campaign started, in the conversation of one of its messages
export const countWhatsAppCampaignReplies = async ({
  client,
  campaignId,
  campaignCreatedAt,
}: {
  client: CoreApiClient;
  campaignId: string;
  campaignCreatedAt: string;
}): Promise<number> => {
  const { messages } = await client.query({
    messages: {
      __args: { filter: { whatsAppCampaignId: { eq: campaignId } }, first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS },
      edges: { node: { id: true } },
    },
  });
  const campaignMessageIds = (messages?.edges ?? []).map(({ node }: { node: { id: string } }) => node.id);

  if (campaignMessageIds.length === 0) {
    return 0;
  }

  const { messageChannelMessageAssociations: campaignAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: { filter: { messageId: { in: campaignMessageIds } }, first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS },
      edges: { node: { messageThreadExternalId: true } },
    },
  });
  const threadExternalIds = [
    ...new Set(
      (campaignAssociations?.edges ?? [])
        .map(({ node }: { node: { messageThreadExternalId: string | null } }) => node.messageThreadExternalId)
        .filter(isNonEmptyString),
    ),
  ];

  if (threadExternalIds.length === 0) {
    return 0;
  }

  const { messageChannelMessageAssociations: replyAssociations } = await client.query({
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
  });

  return new Set(
    (replyAssociations?.edges ?? []).map(
      ({ node }: { node: { messageThreadExternalId: string | null } }) => node.messageThreadExternalId,
    ),
  ).size;
};
