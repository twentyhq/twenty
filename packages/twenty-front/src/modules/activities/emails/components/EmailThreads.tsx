import { useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { EmailLoader } from '@/activities/emails/components/EmailLoader';
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
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
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

  const {
    data,
    loading: firstQueryLoading,
    fetchMore,
    error,
  } = useQuery(threadQuery, {
    variables: threadQueryVariables,
  });

  const fetchMoreRecords = async () => {
    if (
      emailThreadsPage.hasNextPage &&
      !isFetchingMoreEmails &&
      !firstQueryLoading
    ) {
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

  if (firstQueryLoading) {
    return <EmailLoader />;
  }

  if (!firstQueryLoading && !timelineThreads?.length) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyInbox" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Empty Inbox
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            No email exchange has occurred with this record yet.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              Inbox <StyledEmailCount>{totalNumberOfThreads}</StyledEmailCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />
        {!firstQueryLoading && (
          <Card>
            {timelineThreads?.map((thread: TimelineThread, index: number) => (
              <EmailThreadPreview
                key={index}
                divider={index < timelineThreads.length - 1}
                thread={thread}
                onClick={
                  thread.visibility === 'share_everything'
                    ? () => openEmailThread(thread.id)
                    : () => {}
                }
                visibility={
                  // TODO: Fix typing for visibility
                  thread.visibility as
                    | 'metadata'
                    | 'subject'
                    | 'share_everything'
                }
              />
            ))}
          </Card>
        )}
        <EmailThreadFetchMoreLoader
          loading={isFetchingMoreEmails || firstQueryLoading}
          onLastRowVisible={fetchMoreRecords}
        />
      </Section>
    </StyledContainer>
  );
};
