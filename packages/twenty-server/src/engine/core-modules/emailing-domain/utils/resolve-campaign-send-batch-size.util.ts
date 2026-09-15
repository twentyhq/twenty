import { CAMPAIGN_SEND_BATCH_SIZE } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-batch-size.constant';

const SMALLEST_SENDABLE_BATCH_SIZE = 1;

export const resolveCampaignSendBatchSize = (
  configuredEmailSendRateLimit: number,
): number =>
  Math.max(
    SMALLEST_SENDABLE_BATCH_SIZE,
    Math.floor(
      Math.min(CAMPAIGN_SEND_BATCH_SIZE, configuredEmailSendRateLimit),
    ),
  );
