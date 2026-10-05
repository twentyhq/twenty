import { t } from '@lingui/core/macro';

import { type CampaignDeliveryTiming } from '@/side-panel/pages/send-campaign/types/CampaignDeliveryTiming';

export const buildCampaignSendButtonTitle = ({
  deliveryTiming,
  isAlreadyScheduled,
}: {
  deliveryTiming: CampaignDeliveryTiming;
  isAlreadyScheduled: boolean;
}): string => {
  if (deliveryTiming === 'NOW') {
    return t`Send campaign`;
  }

  return isAlreadyScheduled ? t`Reschedule campaign` : t`Schedule campaign`;
};
