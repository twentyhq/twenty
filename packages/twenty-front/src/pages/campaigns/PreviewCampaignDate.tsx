import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { TextInput } from 'tsup.ui.index';

import { H2Title } from '@/ui/display/typography/components/H2Title';
const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledPreviewCampaignDate = styled.span`
  margin-top: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;
export const PreviewCampaignDate = ({ startDate, endDate }) => {
  return (
    <>
      <StyledPreviewCampaignDate>
        <StyledComboInputContainer>
          <Section>
            <H2Title title="Start Date " description="Selected Start Date" />
            <TextInput name="campaignName" value={startDate} disabled />
          </Section>
          <Section>
            <H2Title title="End Date " description="Selected End Date" />
            <TextInput name="campaignName" value={endDate} disabled />
          </Section>
        </StyledComboInputContainer>
      </StyledPreviewCampaignDate>
    </>
  );
};
