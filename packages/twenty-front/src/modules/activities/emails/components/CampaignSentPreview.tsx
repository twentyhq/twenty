import { t } from '@lingui/core/macro';

import { CampaignSentEnvelope } from '@/activities/emails/components/CampaignSentEnvelope';
import { StyledCampaignWidgetContainer } from '@/activities/emails/components/CampaignWidgetContainer';
import { EmailEditorCanvas } from '@/activities/emails/editor/components/EmailEditorCanvas';
import { CAMPAIGN_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/CampaignBodyEditorProfile';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';

type CampaignSentPreviewProps = {
  campaign: MessageCampaign;
};

export const CampaignSentPreview = ({ campaign }: CampaignSentPreviewProps) => (
  <StyledCampaignWidgetContainer>
    <CampaignSentEnvelope campaign={campaign} />
    <StyledWidgetScrollContainer>
      <FormAdvancedTextFieldInput
        defaultValue={campaign.bodyTemplate}
        readonly
        profile={CAMPAIGN_BODY_EDITOR_PROFILE}
        EditorComponent={EmailEditorCanvas}
        placeholder={t`No content`}
      />
    </StyledWidgetScrollContainer>
  </StyledCampaignWidgetContainer>
);
