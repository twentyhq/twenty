import { type CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';

export type CampaignMessageDeliveryStatus =
  (typeof CAMPAIGN_MESSAGE_DELIVERY_STATUS)[keyof typeof CAMPAIGN_MESSAGE_DELIVERY_STATUS];
