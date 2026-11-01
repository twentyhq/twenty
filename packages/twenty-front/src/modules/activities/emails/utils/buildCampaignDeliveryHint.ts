import { t } from '@lingui/core/macro';

import { type CampaignDeliveryTiming } from '@/activities/emails/types/CampaignDeliveryTiming';

export const buildCampaignDeliveryHint = ({
  deliveryTiming,
  isAlreadyScheduled,
  hasValidSendTime,
}: {
  deliveryTiming: CampaignDeliveryTiming;
  isAlreadyScheduled: boolean;
  hasValidSendTime: boolean;
}): string => {
  if (deliveryTiming === 'NOW') {
    return isAlreadyScheduled
      ? t`Sending starts right away, ahead of the time this campaign is holding.`
      : t`Sending starts right away and cannot be undone.`;
  }

  return hasValidSendTime
    ? t`Recipients are recounted at send time. You can cancel until then.`
    : t`Pick a send time in the future.`;
};
