import styled from '@emotion/styled';

import {
  H1Title,
  H1TitleFontColor,
} from '@/ui/display/typography/components/H1Title';
import { Card } from '@/ui/layout/card/components/Card';
import { Section } from '@/ui/layout/section/components/Section';
import { mockedEmails as emails } from '~/testing/mock-data/activities';

import { EmailPreview } from './EmailPreview';

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
            Inbox <StyledEmailCount>{emails.length}</StyledEmailCount>
          </>
        }
        fontColor={H1TitleFontColor.Primary}
      />
      <Card>
        {emails.map((email, index) => (
          <EmailPreview divider={index < emails.length - 1} email={email} />
        ))}
      </Card>
    </Section>
  </StyledContainer>
);
