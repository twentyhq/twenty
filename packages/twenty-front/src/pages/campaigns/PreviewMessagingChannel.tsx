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

const StyledPreviewMessagingChannel = styled.span`
  margin-top: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

export const PreviewMessagingChannel = () => {
  return (
    <>
      <StyledPreviewMessagingChannel>
        <StyledComboInputContainer>
          <Section>
            <H2Title
              title="Messaging channel"
              description="Selected messaging channel"
            />
            <TextInput
              name="Messaging channel"
              value={'Selected Messaging channel'}
              disabled
            />
          </Section>
          {/* <Section>
            <H2Title title="End Date " description="Selected End Date" />
            <TextInput
              name="campaignName"
              value={'Selected End Date'}
              disabled
            />
          </Section> */}
        </StyledComboInputContainer>
      </StyledPreviewMessagingChannel>
    </>
  );
};

