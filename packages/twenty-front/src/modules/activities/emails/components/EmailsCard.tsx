import { TIMELINE_THREADS_REFETCH_QUERIES } from '@/activities/emails/constants/TimelineThreadsRefetchQueries';
import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EmailsCardContent } from '@/activities/emails/components/EmailsCardContent';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/Messaging';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useSubscribeTimelineToParticipantChanges } from '@/activities/hooks/useSubscribeTimelineToParticipantChanges';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type TimelineThreadsWithTotal } from '~/generated/graphql';

export const EmailsCard = () => {
  const targetRecord = useTargetRecord();
  const apolloCoreClient = useApolloCoreClient();
  const timelineThreadChannelFilter = useAtomFamilyStateValue(
    timelineThreadChannelFilterFamilyState,
    targetRecord.id,
  );

  const {
    data,
    error,
    firstQueryLoading,
    isFetchingMore,
    fetchMoreRecords,
    refetch,
  } = useCustomResolver<TimelineThreadsWithTotal>({
    query: getTimelineThreadsFromObjectRecord,
    queryName: 'getTimelineThreadsFromObjectRecord',
    objectName: 'timelineThreads',
    activityTargetableObject: targetRecord,
    pageSize: TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
    variables: { channel: timelineThreadChannelFilter },
  });

  useSubscribeTimelineToParticipantChanges({
    queryId: `emails-${targetRecord.id}`,
    participantObjectNameSingular:
      StandardObjectNameSingular.MessageParticipant,
    relatedPersonIds:
      data?.getTimelineThreadsFromObjectRecord?.relatedPersonIds ?? [],
    refetch: () =>
      apolloCoreClient.refetchQueries({
        include: TIMELINE_THREADS_REFETCH_QUERIES,
      }),
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
      <ToastOnQueryErrorEffect error={error} />

      <WidgetHeaderCountEffect count={totalNumberOfThreads} />
      <EmailsCardContent
        error={error}
        onRetry={() => refetch()}
        isFiltered={isDefined(timelineThreadChannelFilter)}
        firstQueryLoading={firstQueryLoading}
        isFetchingMore={isFetchingMore}
        onLastRowVisible={handleLastRowVisible}
        timelineThreads={timelineThreads}
      />
    </>
  );
};
