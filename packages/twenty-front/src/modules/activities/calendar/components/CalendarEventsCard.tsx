import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { CalendarEventsCardContent } from '@/activities/calendar/components/CalendarEventsCardContent';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useSubscribeTimelineToParticipantChanges } from '@/activities/hooks/useSubscribeTimelineToParticipantChanges';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type TimelineCalendarEventsWithTotal } from '~/generated/graphql';

export const CalendarEventsCard = () => {
  const targetRecord = useTargetRecord();

  const {
    data,
    error,
    firstQueryLoading,
    isFetchingMore,
    fetchMoreRecords,
    refetch,
  } = useCustomResolver<TimelineCalendarEventsWithTotal>({
    query: getTimelineCalendarEventsFromObjectRecord,
    queryName: 'getTimelineCalendarEventsFromObjectRecord',
    objectName: 'timelineCalendarEvents',
    activityTargetableObject: targetRecord,
    pageSize: TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  });

  useSubscribeTimelineToParticipantChanges({
    queryId: `calendar-${targetRecord.id}`,
    participantObjectNameSingular: 'calendarEventParticipant',
    relatedPersonIds:
      data?.getTimelineCalendarEventsFromObjectRecord?.relatedPersonIds ?? [],
    refetch,
  });

  const { timelineCalendarEvents, totalNumberOfCalendarEvents } =
    data?.getTimelineCalendarEventsFromObjectRecord ?? {};

  const hasMoreCalendarEvents =
    timelineCalendarEvents && totalNumberOfCalendarEvents
      ? timelineCalendarEvents?.length < totalNumberOfCalendarEvents
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreCalendarEvents) {
      await fetchMoreRecords();
    }
  };

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />

      <WidgetHeaderCountEffect count={totalNumberOfCalendarEvents} />
      <CalendarEventsCardContent
        firstQueryLoading={firstQueryLoading}
        isFetchingMore={isFetchingMore}
        objectName={targetRecord.targetObjectNameSingular}
        onLastRowVisible={handleLastRowVisible}
        timelineCalendarEvents={timelineCalendarEvents}
      />
    </>
  );
};
