import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { type CampaignDeliveryState } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';

export const UNFINISHED_CAMPAIGN_DELIVERY_STATES: CampaignDeliveryState[] = [
  CAMPAIGN_DELIVERY_STATE.QUEUED,
  CAMPAIGN_DELIVERY_STATE.SENDING,
];
