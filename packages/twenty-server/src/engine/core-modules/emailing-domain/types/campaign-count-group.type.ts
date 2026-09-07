import { type CampaignDeliveryState } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';

export type CampaignCountGroup = {
  state: CampaignDeliveryState;
  total: string;
  deliveredCount: string;
  bouncedCount: string;
  complainedCount: string;
  providerFailedCount: string;
};
