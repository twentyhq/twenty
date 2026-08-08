import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { EmailEditorCanvas } from '@/activities/emails/editor/components/EmailEditorCanvas';
import { CAMPAIGN_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/CampaignBodyEditorProfile';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`;

type CampaignSentPreviewProps = {
  campaign: MessageCampaign;
};

export const CampaignSentPreview = ({ campaign }: CampaignSentPreviewProps) => {
  return (
    <StyledContainer>
      <FormAdvancedTextFieldInput
        defaultValue={campaign.bodyTemplate}
        readonly
        profile={CAMPAIGN_BODY_EDITOR_PROFILE}
        EditorComponent={EmailEditorCanvas}
        placeholder={t`No content`}
      />
    </StyledContainer>
  );
};
