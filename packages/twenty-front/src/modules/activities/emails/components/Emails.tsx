import { gql, useQuery } from '@apollo/client';
import styled from '@emotion/styled';

import {
  H1Title,
  H1TitleFontColor,
} from '@/ui/display/typography/components/H1Title';
import { Card } from '@/ui/layout/card/components/Card';
import { Section } from '@/ui/layout/section/components/Section';

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

export const Emails = () => {
  const emailQuery = gql`
    query EmailQuery {
      timelineMessage(personId: "1") {
        body
        numberOfEmailsInThread
        read
        receivedAt
        senderName
        senderPictureUrl
        subject
      }
    }
  `;

  const messages = useQuery(emailQuery);

  if (messages.loading) {
    return <div>Loading...</div>;
  }

  console.log(messages.data);

  const timelineMessages = messages.data.timelineMessage;

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              Inbox{' '}
              <StyledEmailCount>{timelineMessages.length}</StyledEmailCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />
        <Card>
          {timelineMessages.map((message: any, index: any) => (
            <EmailPreview
              divider={index < timelineMessages.length - 1}
              email={message}
            />
          ))}
        </Card>
      </Section>
    </StyledContainer>
  );
};
