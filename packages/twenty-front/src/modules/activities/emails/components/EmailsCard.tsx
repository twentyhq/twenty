import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { ActivityList } from '@/activities/components/ActivityList';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { EmptyInboxPlaceholder } from '@/activities/emails/components/EmptyInboxPlaceholder';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/Messaging';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useSubscribeTimelineToParticipantChanges } from '@/activities/hooks/useSubscribeTimelineToParticipantChanges';
import { usePublishWidgetHeaderInfo } from '@/page-layout/widgets/hooks/usePublishWidgetHeaderInfo';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { IconPlus } from 'twenty-ui/icon';
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

export const EmailsCard = () => {
  const targetRecord = useTargetRecord();
  const { openComposer, loading: composerLoading } =
    useComposeEmailForTargetRecord();

  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords, refetch } =
    useCustomResolver<TimelineThreadsWithTotal>(
      getTimelineThreadsFromObjectRecord,
      'getTimelineThreadsFromObjectRecord',
      'timelineThreads',
      targetRecord,
      TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
    );

  useSubscribeTimelineToParticipantChanges({
    queryId: `emails-${targetRecord.id}`,
    participantObjectNameSingular: CoreObjectNameSingular.MessageParticipant,
    relatedPersonIds:
      data?.getTimelineThreadsFromObjectRecord?.relatedPersonIds ?? [],
    refetch,
  });

  const { totalNumberOfThreads, timelineThreads } =
    data?.getTimelineThreadsFromObjectRecord ?? {};

  const composeAction = useMemo(
    () => ({
      Icon: IconPlus,
      label: t`Compose`,
      onClick: openComposer,
      disabled: composerLoading,
    }),
    [openComposer, composerLoading],
  );

  usePublishWidgetHeaderInfo({
    count: totalNumberOfThreads,
    primaryAction: composeAction,
  });

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
