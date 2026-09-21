import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type CampaignDeliveryTiming } from '@/side-panel/pages/send-campaign/types/CampaignDeliveryTiming';

export const buildCampaignDeliveryHint = ({
  deliveryTiming,
  isAlreadyScheduled,
  formattedSendTime,
}: {
  deliveryTiming: CampaignDeliveryTiming;
  isAlreadyScheduled: boolean;
  formattedSendTime: string | null;
}): string => {
  if (deliveryTiming === 'NOW') {
    return isAlreadyScheduled
      ? t`Sending starts right away, ahead of the time this campaign is holding.`
      : t`Sending starts right away and cannot be undone.`;
  }

  if (!isDefined(formattedSendTime)) {
    return t`Pick a send time in the future.`;
  }

  return t`Sending starts ${formattedSendTime}. You can cancel before then.`;
};
