import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { CampaignSentEnvelope } from '@/activities/emails/components/CampaignSentEnvelope';
import { StyledCampaignWidgetContainer } from '@/activities/emails/components/CampaignWidgetContainer';
import { EmailEditorCanvas } from '@/activities/emails/editor/components/EmailEditorCanvas';
import { CAMPAIGN_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/CampaignBodyEditorProfile';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

type CampaignSentPreviewProps = {
  campaign: MessageCampaign;
};

export const CampaignSentPreview = ({ campaign }: CampaignSentPreviewProps) => (
  <StyledCampaignWidgetContainer>
    <CampaignSentEnvelope campaign={campaign} />
    <StyledBody>
      <FormAdvancedTextFieldInput
        defaultValue={campaign.bodyTemplate}
        readonly
        profile={CAMPAIGN_BODY_EDITOR_PROFILE}
        EditorComponent={EmailEditorCanvas}
        placeholder={t`No content`}
      />
    </StyledBody>
  </StyledCampaignWidgetContainer>
);
