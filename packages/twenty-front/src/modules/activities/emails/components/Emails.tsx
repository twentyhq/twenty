import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';

import { getTimelineThreadsFromCompanyId } from '@/activities/emails/queries/getTimelineThreadsFromCompanyId';
import { getTimelineThreadsFromPersonId } from '@/activities/emails/queries/getTimelineThreadsFromPersonId';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import {
  H1Title,
  H1TitleFontColor,
} from '@/ui/display/typography/components/H1Title';
import { Card } from '@/ui/layout/card/components/Card';
import { Section } from '@/ui/layout/section/components/Section';
import { TimelineThread } from '~/generated/graphql';

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
  const emailQuery =
    entity.type === 'Person'
      ? getTimelineThreadsFromPersonId
      : getTimelineThreadsFromCompanyId;

  const variables =
    entity.type === 'Person'
      ? { personId: entity.id }
      : { companyId: entity.id };

  const messages = useQuery(emailQuery, {
    variables: variables,
  });

  if (messages.loading) {
    return;
  }

  const timelineThreads: TimelineThread[] =
    messages.data[
      entity.type === 'Person'
        ? 'getTimelineThreadsFromPersonId'
        : 'getTimelineThreadsFromCompanyId'
    ];

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              Inbox{' '}
              <StyledEmailCount>{timelineThreads.length}</StyledEmailCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />
        <Card>
          {timelineThreads.map((message: TimelineThread, index: number) => (
            <EmailPreview
              key={index}
              divider={index < timelineThreads.length - 1}
              email={message}
            />
          ))}
        </Card>
      </Section>
    </StyledContainer>
  );
};
