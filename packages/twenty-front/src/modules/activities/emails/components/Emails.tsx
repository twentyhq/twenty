import { gql, useQuery } from '@apollo/client';
import styled from '@emotion/styled';

import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import {
  H1Title,
  H1TitleFontColor,
} from '@/ui/display/typography/components/H1Title';
import { Card } from '@/ui/layout/card/components/Card';
import { Section } from '@/ui/layout/section/components/Section';
import { TimelineMessage } from '~/generated/graphql';

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

export const Emails = ({ entity }: { entity: ActivityTargetableEntity }) => {
  const emailQuery = gql`
    query EmailQuery($personId: String!) {
      timelineMessage(personId: $personId) {
        body
        numberOfMessagesInThread
        read
        receivedAt
        senderName
        senderPictureUrl
        subject
      }
    }
  `;

  const messages = useQuery(emailQuery, {
    variables: { personId: entity.id },
  });

  if (messages.loading) {
    return;
  }

  const timelineMessages: TimelineMessage[] = messages.data.timelineMessage;

  // This hard limit is just for the POC, we will implement pagination later
  const firstTenMessages = timelineMessages.slice(0, 10);

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
          {firstTenMessages.map((message: any, index: any) => (
            <EmailPreview
              key={index}
              divider={index < firstTenMessages.length - 1}
              email={message}
            />
          ))}
        </Card>
      </Section>
    </StyledContainer>
  );
};
