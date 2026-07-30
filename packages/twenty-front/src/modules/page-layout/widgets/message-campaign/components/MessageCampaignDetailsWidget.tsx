import { isDefined } from 'twenty-shared/utils';

import { CampaignDetailsFields } from '@/activities/emails/components/CampaignDetailsFields';
import { useTargetMessageCampaign } from '@/activities/emails/hooks/useTargetMessageCampaign';

export const MessageCampaignDetailsWidget = () => {
  const { campaign, isDraft } = useTargetMessageCampaign();

  // The widget is also gated on DRAFT by its conditionalAvailabilityExpression;
  // this keeps the fields out of page layout edit mode on a sent campaign.
  if (!isDefined(campaign) || !isDraft) {
    return null;
  }

  return <CampaignDetailsFields key={campaign.id} campaign={campaign} />;
};
