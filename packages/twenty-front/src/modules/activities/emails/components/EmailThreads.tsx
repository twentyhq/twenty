import { useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { EmailThreadFetchMoreLoader } from '@/activities/emails/components/EmailThreadFetchMoreLoader';
import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/messaging.constants';
import { useEmailThreadStates } from '@/activities/emails/hooks/internal/useEmailThreadStates';
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
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import {
  GetTimelineThreadsFromPersonIdQueryVariables,
  TimelineThread,
  TimelineThreadsWithTotal,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6, 6, 2)};
  height: 100%;
  overflow: auto;
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

  const { getEmailThreadsPageState } = useEmailThreadStates({
    emailThreadScopeId: getScopeIdFromComponentId(entity.id),
  });

  const [emailThreadsPage, setEmailThreadsPage] = useRecoilState(
    getEmailThreadsPageState(),
  );

  const [isFetchingMoreEmails, setIsFetchingMoreEmails] = useState(false);

  const [threadQuery, queryName] =
    entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? [getTimelineThreadsFromPersonId, 'getTimelineThreadsFromPersonId']
      : [getTimelineThreadsFromCompanyId, 'getTimelineThreadsFromCompanyId'];

  const threadQueryVariables = {
    ...(entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? { personId: entity.id }
      : { companyId: entity.id }),
    page: 1,
    pageSize: TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  } as GetTimelineThreadsFromPersonIdQueryVariables;

  const { data, loading, fetchMore, error } = useQuery(threadQuery, {
    variables: threadQueryVariables,
  });

  const fetchMoreRecords = async () => {
    if (emailThreadsPage.hasNextPage && !isFetchingMoreEmails) {
      setIsFetchingMoreEmails(true);

      await fetchMore({
        variables: {
          ...threadQueryVariables,
          page: emailThreadsPage.pageNumber + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.[queryName]?.timelineThreads?.length) {
            setEmailThreadsPage((emailThreadsPage) => ({
              ...emailThreadsPage,
              hasNextPage: false,
            }));
            return {
              [queryName]: {
                ...prev?.[queryName],
                timelineThreads: [
                  ...(prev?.[queryName]?.timelineThreads ?? []),
                ],
              },
            };
          }

          return {
            [queryName]: {
              ...prev?.[queryName],
              timelineThreads: [
                ...(prev?.[queryName]?.timelineThreads ?? []),
                ...(fetchMoreResult?.[queryName]?.timelineThreads ?? []),
              ],
            },
          };
        },
      });
      setEmailThreadsPage((emailThreadsPage) => ({
        ...emailThreadsPage,
        pageNumber: emailThreadsPage.pageNumber + 1,
      }));
      setIsFetchingMoreEmails(false);
    }
  };

  if (error) {
    enqueueSnackBar(error.message || 'Error loading email threads', {
      variant: 'error',
    });
  }

  const { totalNumberOfThreads, timelineThreads }: TimelineThreadsWithTotal =
    data?.[queryName] ?? [];

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              Inbox{' '}
              <StyledEmailCount>{totalNumberOfThreads ?? 0}</StyledEmailCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />
        {!loading && (
          <Card>
            {timelineThreads?.map((thread: TimelineThread, index: number) => (
              <EmailThreadPreview
                key={index}
                divider={index < timelineThreads.length - 1}
                thread={thread}
                onClick={() => openEmailThread(thread)}
              />
            ))}
          </Card>
        )}
        <EmailThreadFetchMoreLoader
          loading={isFetchingMoreEmails}
          onLastRowVisible={fetchMoreRecords}
        />
      </Section>
    </StyledContainer>
  );
};
