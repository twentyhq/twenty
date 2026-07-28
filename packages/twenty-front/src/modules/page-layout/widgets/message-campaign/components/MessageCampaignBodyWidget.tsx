import { isDefined } from 'twenty-shared/utils';

import { CampaignBodyField } from '@/activities/emails/components/CampaignBodyField';
import { CampaignSentPreview } from '@/activities/emails/components/CampaignSentPreview';
import { useTargetMessageCampaign } from '@/activities/emails/hooks/useTargetMessageCampaign';

export const MessageCampaignBodyWidget = () => {
  const { campaign, isDraft } = useTargetMessageCampaign();

  if (!isDefined(campaign)) {
    return null;
  }

  return isDraft ? (
    <CampaignBodyField key={campaign.id} campaign={campaign} />
  ) : (
    <CampaignSentPreview key={campaign.id} campaign={campaign} />
  );
};
