import { CAMPAIGN_ATTEMPTED_MESSAGE_DELIVERY_STATUSES } from 'src/engine/core-modules/emailing-domain/constants/campaign-attempted-message-delivery-statuses.constant';
import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { type CampaignDeliveryStatusCount } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-status-count.type';

export const computeCampaignCounts = ({
  deliveryStatusCounts,
}: {
  deliveryStatusCounts: CampaignDeliveryStatusCount[];
}): CampaignCounts => {
  const countByDeliveryStatus = new Map(
    deliveryStatusCounts.map(({ deliveryStatus, count }) => [
      deliveryStatus,
      count,
    ]),
  );

  const countFor = (deliveryStatus: string): number =>
    countByDeliveryStatus.get(deliveryStatus) ?? 0;

  return {
    attemptedCount: CAMPAIGN_ATTEMPTED_MESSAGE_DELIVERY_STATUSES.reduce(
      (total, deliveryStatus) => total + countFor(deliveryStatus),
      0,
    ),
    sentCount: countFor(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT),
    deliveredCount: countFor(CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED),
    softBouncedCount: countFor(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED),
    failedCount: countFor(CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED),
    skippedCount: countFor(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED),
    bouncedCount: countFor(CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED),
    complainedCount: countFor(CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED),
  };
};
