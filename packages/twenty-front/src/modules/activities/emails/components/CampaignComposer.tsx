import { CampaignBodyField } from '@/activities/emails/components/CampaignBodyField';
import { CampaignDetailsFields } from '@/activities/emails/components/CampaignDetailsFields';
import { StyledCampaignWidgetContainer } from '@/activities/emails/components/CampaignWidgetContainer';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';

type CampaignComposerProps = {
  campaign: MessageCampaign;
};

// One widget, not two: stacked widgets would each get boxed in their own card.
export const CampaignComposer = ({ campaign }: CampaignComposerProps) => (
  <StyledCampaignWidgetContainer>
    <CampaignDetailsFields campaign={campaign} />
    <CampaignBodyField campaign={campaign} />
  </StyledCampaignWidgetContainer>
);
