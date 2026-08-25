import { type CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { isDefined } from 'twenty-shared/utils';

type CountableDelivery = Pick<
  CampaignDeliveryEntity,
  'state' | 'deliveredAt' | 'bouncedAt' | 'complainedAt'
>;

export const computeCampaignCounts = ({
  deliveries,
}: {
  deliveries: CountableDelivery[];
}): CampaignCounts =>
  deliveries.reduce<CampaignCounts>(
    (counts, delivery) => ({
      totalCount: counts.totalCount + 1,
      inProgressCount:
        counts.inProgressCount +
        (delivery.state === CAMPAIGN_DELIVERY_STATE.QUEUED ||
        delivery.state === CAMPAIGN_DELIVERY_STATE.SENDING
          ? 1
          : 0),
      sentCount:
        counts.sentCount +
        (delivery.state === CAMPAIGN_DELIVERY_STATE.SENT ? 1 : 0),
      failedCount:
        counts.failedCount +
        (delivery.state === CAMPAIGN_DELIVERY_STATE.FAILED ? 1 : 0),
      skippedCount:
        counts.skippedCount +
        (delivery.state === CAMPAIGN_DELIVERY_STATE.SKIPPED ? 1 : 0),
      deliveredCount:
        counts.deliveredCount + (isDefined(delivery.deliveredAt) ? 1 : 0),
      bouncedCount:
        counts.bouncedCount + (isDefined(delivery.bouncedAt) ? 1 : 0),
      complainedCount:
        counts.complainedCount + (isDefined(delivery.complainedAt) ? 1 : 0),
    }),
    {
      totalCount: 0,
      inProgressCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      skippedCount: 0,
      bouncedCount: 0,
      complainedCount: 0,
    },
  );
