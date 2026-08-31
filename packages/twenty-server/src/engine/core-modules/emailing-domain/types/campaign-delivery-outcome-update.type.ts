import { type CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';

export type CampaignDeliveryOutcomeUpdate = Partial<
  Pick<
    CampaignDeliveryEntity,
    | 'deliveredAt'
    | 'bouncedAt'
    | 'complainedAt'
    | 'rejectedAt'
    | 'renderingFailedAt'
  >
>;
