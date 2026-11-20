import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_LOGIC_FUNCTION_REFRESH_CAMPAIGN_COUNTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { countWhatsAppCampaignReplies } from 'src/logic-functions/data/count-whatsapp-campaign-replies.util';

// statuses only move forward, so delivered includes read and sent includes both
const STATUSES_BY_COUNT = {
  sentCount: ['SENT', 'DELIVERED', 'READ'],
  deliveredCount: ['DELIVERED', 'READ'],
  readCount: ['READ'],
  failedCount: ['FAILED'],
} as const;

const handler = async ({ campaignId }: { campaignId: string }) => {
  const client = new CoreApiClient();
  const { whatsAppCampaign } = await client.query({
    whatsAppCampaign: { __args: { filter: { id: { eq: campaignId } } }, id: true, createdAt: true },
  });

  if (!isDefined(whatsAppCampaign)) {
    return;
  }

  const statusCounts = Object.fromEntries(
    await Promise.all(
      Object.entries(STATUSES_BY_COUNT).map(async ([countName, statuses]) => {
        const { messages } = await client.query({
          messages: {
            __args: { filter: { whatsAppCampaignId: { eq: campaignId }, whatsAppStatus: { in: [...statuses] } } },
            totalCount: true,
          },
        });

        return [countName, messages?.totalCount ?? 0];
      }),
    ),
  );

  await client.mutation({
    updateWhatsAppCampaign: {
      __args: {
        id: campaignId,
        data: {
          ...statusCounts,
          repliedCount: await countWhatsAppCampaignReplies({
            client,
            campaignId,
            campaignCreatedAt: whatsAppCampaign.createdAt,
          }),
        },
      },
      id: true,
    },
  });
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_REFRESH_CAMPAIGN_COUNTS_UNIVERSAL_IDENTIFIER,
  name: 'refresh-campaign-counts',
  description: 'Recounts the sent, delivered, read, failed and replied messages of a WhatsApp campaign',
  timeoutSeconds: 60,
  handler,
});
