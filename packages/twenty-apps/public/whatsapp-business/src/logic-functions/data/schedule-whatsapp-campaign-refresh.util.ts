import { WHATSAPP_CAMPAIGN_REFRESH_INTERVAL_MS } from 'src/constants/whatsapp-campaign-refresh-interval-ms.constant';
import { WHATSAPP_LOGIC_FUNCTION_REFRESH_CAMPAIGN_COUNTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';

// one delayed refresh per campaign and interval: a burst of statuses costs one recount, and the last one is never lost
export const scheduleWhatsAppCampaignRefresh = async (campaignIds: string[]) => {
  const interval = Math.floor(Date.now() / WHATSAPP_CAMPAIGN_REFRESH_INTERVAL_MS);

  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier: WHATSAPP_LOGIC_FUNCTION_REFRESH_CAMPAIGN_COUNTS_UNIVERSAL_IDENTIFIER,
    payloads: campaignIds.map((campaignId) => ({ campaignId })),
    getJobKey: ({ campaignId }) => `${campaignId}:${interval}`,
    delayMs: WHATSAPP_CAMPAIGN_REFRESH_INTERVAL_MS,
  });
};
