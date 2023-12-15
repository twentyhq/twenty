import styled from '@emotion/styled';

import {
  H1Title,
  H1TitleFontColor,
} from '@/ui/display/typography/components/H1Title';
import { Section } from '@/ui/layout/section/components/Section';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6, 6, 2)};
`;

const StyledH1Title = styled(H1Title)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmailCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

export const Emails = () => (
  <StyledContainer>
    <Section>
      <StyledH1Title
        title={
          <>
            Inbox <StyledEmailCount>2</StyledEmailCount>
          </>
        }
        fontColor={H1TitleFontColor.Primary}
      />
    </Section>
  </StyledContainer>
);
