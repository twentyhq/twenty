import { t } from '@lingui/core/macro';

import { type CampaignDeliveryTiming } from '@/activities/emails/types/CampaignDeliveryTiming';

export const buildCampaignSendButtonTitle = ({
  deliveryTiming,
  isAlreadyScheduled,
}: {
  deliveryTiming: CampaignDeliveryTiming;
  isAlreadyScheduled: boolean;
}): string => {
  if (deliveryTiming === 'NOW') {
    return isAlreadyScheduled ? t`Send Now` : t`Send Campaign`;
  }

  return isAlreadyScheduled ? t`Reschedule Campaign` : t`Schedule Campaign`;
};
