import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { useCampaignBodyState } from '@/activities/emails/hooks/useCampaignBodyState';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`;

type CampaignBodyFieldProps = {
  campaign: MessageCampaign;
};

export const CampaignBodyField = ({ campaign }: CampaignBodyFieldProps) => {
  const { body, setBody } = useCampaignBodyState({ campaign });

  return (
    <StyledContainer>
      <FormAdvancedTextFieldInput
        defaultValue={body}
        onChange={setBody}
        placeholder={t`Type something or press "/" to see commands`}
        minHeight={400}
        maxWidth={900}
        contentType="html"
      />
    </StyledContainer>
  );
};
