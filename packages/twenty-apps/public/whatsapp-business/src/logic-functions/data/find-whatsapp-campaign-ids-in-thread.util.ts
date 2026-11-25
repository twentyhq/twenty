import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

const RECENT_OUTGOING_MESSAGES_LIMIT = 20;

export const findWhatsAppCampaignIdsInThread = async ({
  messageChannelId,
  threadExternalId,
}: {
  messageChannelId: string;
  threadExternalId: string;
}): Promise<string[]> => {
  const { messageChannelMessageAssociations } = await new CoreApiClient().query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageChannelId: { eq: messageChannelId },
          messageThreadExternalId: { eq: threadExternalId },
          direction: { eq: 'OUTGOING' },
        },
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: RECENT_OUTGOING_MESSAGES_LIMIT,
      },
      edges: { node: { message: { whatsAppCampaignId: true } } },
    },
  });

  const campaignIds: string[] = (messageChannelMessageAssociations?.edges ?? [])
    .map(({ node }: { node: { message: { whatsAppCampaignId: string | null } | null } }) => node.message?.whatsAppCampaignId)
    .filter(isNonEmptyString);

  return [...new Set(campaignIds)];
};
