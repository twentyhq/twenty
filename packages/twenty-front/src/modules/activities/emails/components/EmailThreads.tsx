import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';

import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/messaging.constants';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { getTimelineThreadsFromCompanyId } from '@/activities/emails/queries/getTimelineThreadsFromCompanyId';
import { getTimelineThreadsFromPersonId } from '@/activities/emails/queries/getTimelineThreadsFromPersonId';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
  H1Title,
  H1TitleFontColor,
} from '@/ui/display/typography/components/H1Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Card } from '@/ui/layout/card/components/Card';
import { Section } from '@/ui/layout/section/components/Section';
import { TimelineThread } from '~/generated/graphql';

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

export const EmailThreads = ({
  entity,
}: {
  entity: ActivityTargetableObject;
}) => {
  const { openEmailThread } = useEmailThread();

  const { enqueueSnackBar } = useSnackBar();

  const threadQuery =
    entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? getTimelineThreadsFromPersonId
      : getTimelineThreadsFromCompanyId;

  const threadQueryVariables = {
    ...(entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? { personId: entity.id }
      : { companyId: entity.id }),
    page: 1,
    pageSize: TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  };

  const threads = useQuery(threadQuery, {
    variables: threadQueryVariables,
  });

  if (threads.error) {
    enqueueSnackBar(threads.error.message || 'Error loading email threads', {
      variant: 'error',
    });
  }

  if (threads.loading) {
    return;
  }

  const timelineThreads: TimelineThread[] =
    threads?.data?.[
      entity.targetObjectNameSingular === CoreObjectNameSingular.Person
        ? 'getTimelineThreadsFromPersonId'
        : 'getTimelineThreadsFromCompanyId'
    ] ?? [];

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              Inbox{' '}
              <StyledEmailCount>{timelineThreads?.length}</StyledEmailCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />
        <Card>
          {timelineThreads.map((thread: TimelineThread, index: number) => (
            <EmailThreadPreview
              key={index}
              divider={index < timelineThreads.length - 1}
              thread={thread}
              onClick={() => openEmailThread(thread)}
            />
          ))}
        </Card>
      </Section>
    </StyledContainer>
  );
};
