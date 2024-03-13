import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { TextArea, TextInput } from 'tsup.ui.index';

import { H2Title } from '@/ui/display/typography/components/H2Title';

const StyledAreaLabel = styled.span`
  align-content: flex-start;
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(10)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  width: 100%;
`;
const StyledPreviewCampaignDetails = styled.span`
  margin-top: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export const PreviewCampaignDetailsTab = ({
  campaignName,
  campaignDescription,
}) => {
  return (
    <>
      <StyledPreviewCampaignDetails>
        <Section>
          <H2Title
            title="Campaign Name"
            description="Your Campaign name will be displayed in Campaign List"
          />
          <TextInput
            // value={'campaignName'}StyledAreaLabel
            name="campaignName"
            value={campaignName}
            fullWidth
            disabled
          />
        </Section>

        <StyledAreaLabel>
          <Section>
            <H2Title
              title="Campaign Description"
              description="Describe the main objectives and goals of the campaign "
            />
          </Section>
          <TextArea
            value={campaignDescription}
            placeholder={'Enter campaign description'}
            minRows={1}
            disabled
          />
        </StyledAreaLabel>
      </StyledPreviewCampaignDetails>
    </>
  );
};
