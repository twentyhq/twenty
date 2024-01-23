import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';

import { ThreadPreview } from '@/activities/emails/components/ThreadPreview';
import { useThread } from '@/activities/emails/hooks/useThread';
import {
  MockedThread,
  mockedThreads,
} from '@/activities/emails/mocks/mockedThreads';
import { getTimelineThreadsFromCompanyId } from '@/activities/emails/queries/getTimelineThreadsFromCompanyId';
import { getTimelineThreadsFromPersonId } from '@/activities/emails/queries/getTimelineThreadsFromPersonId';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
  H1Title,
  H1TitleFontColor,
} from '@/ui/display/typography/components/H1Title';
import { Card } from '@/ui/layout/card/components/Card';
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

export const Threads = ({ entity }: { entity: ActivityTargetableObject }) => {
  const { openThread } = useThread();

  const threadQuery =
    entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? getTimelineThreadsFromPersonId
      : getTimelineThreadsFromCompanyId;

  const threadQueryVariables =
    entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? { personId: entity.id }
      : { companyId: entity.id };

  const threads = useQuery(threadQuery, {
    variables: threadQueryVariables,
  });

  if (threads.loading) {
    return;
  }

  // To use once the id is returned by the query

  // const fetchedTimelineThreads: TimelineThread[] =
  //   threads.data[
  //     entity.targetObjectNameSingular === CoreObjectNameSingular.Person
  //       ? 'getTimelineThreadsFromPersonId'
  //       : 'getTimelineThreadsFromCompanyId'
  //   ];

  const timelineThreads = mockedThreads;

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              Inbox{' '}
              <StyledEmailCount>
                {timelineThreads && timelineThreads.length}
              </StyledEmailCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />
        <Card>
          {timelineThreads &&
            timelineThreads.map((thread: MockedThread, index: number) => (
              <ThreadPreview
                key={index}
                divider={index < timelineThreads.length - 1}
                thread={thread}
                onClick={() => openThread(thread)}
              />
            ))}
        </Card>
      </Section>
    </StyledContainer>
  );
};
