import { CoreObjectNameSingular } from 'twenty-shared/types';

import { EmailsCardContent } from '@/activities/emails/components/EmailsCardContent';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/Messaging';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useSubscribeTimelineToParticipantChanges } from '@/activities/hooks/useSubscribeTimelineToParticipantChanges';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type TimelineThreadsWithTotal } from '~/generated/graphql';

export const EmailsCard = () => {
  const targetRecord = useTargetRecord();

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

  const hasMoreTimelineThreads =
    timelineThreads && totalNumberOfThreads
      ? timelineThreads?.length < totalNumberOfThreads
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreTimelineThreads) {
      await fetchMoreRecords();
    }
  };

  return (
    <>
      <WidgetHeaderCountEffect count={totalNumberOfThreads} />
      <EmailsCardContent
        firstQueryLoading={firstQueryLoading}
        isFetchingMore={isFetchingMore}
        onLastRowVisible={handleLastRowVisible}
        timelineThreads={timelineThreads}
      />
    </>
  );
};
