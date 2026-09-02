import { isDefined } from 'twenty-shared/utils';

import { CampaignComposer } from '@/activities/emails/components/CampaignComposer';
import { CampaignSentPreview } from '@/activities/emails/components/CampaignSentPreview';
import { useTargetMessageCampaign } from '@/activities/emails/hooks/useTargetMessageCampaign';

export const MessageCampaignBodyWidget = () => {
  const { campaign, isDraft } = useTargetMessageCampaign();

  if (!isDefined(campaign)) {
    return null;
  }

  return isDraft ? (
    <CampaignComposer key={campaign.id} campaign={campaign} />
  ) : (
    <CampaignSentPreview key={campaign.id} campaign={campaign} />
  );
};
