import { type CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';

export type CampaignDeliveryState =
  (typeof CAMPAIGN_DELIVERY_STATE)[keyof typeof CAMPAIGN_DELIVERY_STATE];
