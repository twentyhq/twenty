import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';

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
        enableFullScreen={false}
        minHeight={400}
        maxWidth={900}
        contentType="html"
        placeholder={t`No content`}
      />
    </StyledContainer>
  );
};
