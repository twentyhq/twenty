import { CoreObjectNameSingular } from 'twenty-shared/types';

import { EmailsCardContent } from '@/activities/emails/components/EmailsCardContent';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/Messaging';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useSubscribeTimelineToParticipantChanges } from '@/activities/hooks/useSubscribeTimelineToParticipantChanges';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { IconPlus } from 'twenty-ui/icon';
import { type TimelineThreadsWithTotal } from '~/generated/graphql';

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

  const headerActions = useMemo(
    () => [
      {
        id: 'compose',
        Icon: IconPlus,
        label: t`Compose`,
        onClick: openComposer,
        disabled: composerLoading,
      },
    ],
    [openComposer, composerLoading],
  );

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
      <WidgetHeaderInfoEffect
        count={totalNumberOfThreads}
        actions={headerActions}
      />
      <EmailsCardContent
        firstQueryLoading={firstQueryLoading}
        isFetchingMore={isFetchingMore}
        onLastRowVisible={handleLastRowVisible}
        timelineThreads={timelineThreads}
      />
    </>
  );
};
