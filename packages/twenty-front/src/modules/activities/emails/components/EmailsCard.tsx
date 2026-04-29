import { styled } from '@linaria/react';

import { ActivityList } from '@/activities/components/ActivityList';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { ComposeEmailButton } from '@/activities/emails/components/ComposeEmailButton';
import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { EmptyInboxPlaceholder } from '@/activities/emails/components/EmptyInboxPlaceholder';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/Messaging';
import { getTimelineThreadsFromCompanyId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromCompanyId';
import { getTimelineThreadsFromOpportunityId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromOpportunityId';
import { getTimelineThreadsFromPersonId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromPersonId';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { Trans } from '@lingui/react/macro';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type TimelineThread,
  type TimelineThreadsWithTotal,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]}
    ${themeCssVariables.spacing[2]};
`;

const StyledHeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledH1Title = styled(H1Title)`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: 0;
`;

const StyledEmailCount = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

export const EmailsCard = () => {
  const targetRecord = useTargetRecord();

  const [query, queryName] =
    targetRecord.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? [getTimelineThreadsFromPersonId, 'getTimelineThreadsFromPersonId']
      : targetRecord.targetObjectNameSingular === CoreObjectNameSingular.Company
        ? [getTimelineThreadsFromCompanyId, 'getTimelineThreadsFromCompanyId']
        : [
            getTimelineThreadsFromOpportunityId,
            'getTimelineThreadsFromOpportunityId',
          ];

  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords } =
    useCustomResolver<TimelineThreadsWithTotal>(
      query,
      queryName,
      'timelineThreads',
      targetRecord,
      TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
    );

  const { totalNumberOfThreads, timelineThreads } = data?.[queryName] ?? {};
  const hasMoreTimelineThreads =
    timelineThreads && totalNumberOfThreads
      ? timelineThreads?.length < totalNumberOfThreads
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreTimelineThreads) {
      await fetchMoreRecords();
    }
  };

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  if (!firstQueryLoading && !timelineThreads?.length) {
    return (
      <StyledContainer>
        <EmptyInboxPlaceholder />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Section>
        <StyledHeaderRow>
          <StyledH1Title
            title={
              <>
                <Trans>Inbox</Trans>{' '}
                <StyledEmailCount>{totalNumberOfThreads}</StyledEmailCount>
              </>
            }
            fontColor={H1TitleFontColor.Primary}
          />
          <ComposeEmailButton />
        </StyledHeaderRow>
        {!firstQueryLoading && (
          <ActivityList>
            {timelineThreads?.map((thread: TimelineThread) => (
              <EmailThreadPreview key={thread.id} thread={thread} />
            ))}
          </ActivityList>
        )}
        <CustomResolverFetchMoreLoader
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={handleLastRowVisible}
        />
      </Section>
    </StyledContainer>
  );
};
