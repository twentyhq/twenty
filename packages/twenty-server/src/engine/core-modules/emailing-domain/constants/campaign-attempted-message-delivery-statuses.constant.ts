import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';

export const CAMPAIGN_ATTEMPTED_MESSAGE_DELIVERY_STATUSES: CampaignMessageDeliveryStatus[] =
  [
    CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
    CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
    CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED,
    CAMPAIGN_MESSAGE_DELIVERY_STATUS.REJECTED,
    CAMPAIGN_MESSAGE_DELIVERY_STATUS.RENDERING_FAILED,
    CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
    CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
  ];
