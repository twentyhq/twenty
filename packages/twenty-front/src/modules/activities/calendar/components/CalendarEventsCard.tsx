import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { CalendarEventsCardContent } from '@/activities/calendar/components/CalendarEventsCardContent';
import { CalendarEventsDateRangeFilter } from '@/activities/calendar/components/CalendarEventsDateRangeFilter';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { type CalendarEventsCustomDateRange } from '@/activities/calendar/types/CalendarEventsCustomDateRange';
import { type CalendarEventsDateRangePreset } from '@/activities/calendar/types/CalendarEventsDateRangePreset';
import { getCalendarEventsDateRangeVariables } from '@/activities/calendar/utils/getCalendarEventsDateRangeVariables';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useSubscribeTimelineToParticipantChanges } from '@/activities/hooks/useSubscribeTimelineToParticipantChanges';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { type TimelineCalendarEventsWithTotal } from '~/generated/graphql';

export const CalendarEventsCard = () => {
  const targetRecord = useTargetRecord();
  const { userTimezone } = useUserTimezone();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const [dateRangePreset, setDateRangePreset] =
    useState<CalendarEventsDateRangePreset>('ALL');
  const [customDateRange, setCustomDateRange] =
    useState<CalendarEventsCustomDateRange>({});

  const dateRangeVariables = getCalendarEventsDateRangeVariables({
    preset: dateRangePreset,
    customDateRange,
    now: Temporal.Now.zonedDateTimeISO(userTimezone),
    firstDayOfTheWeek: userFirstDayOfTheWeek,
  });

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
    extraVariables: dateRangeVariables,
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

  const isDateRangeFiltered =
    isDefined(dateRangeVariables.startsAtFrom) ||
    isDefined(dateRangeVariables.startsAtBefore);

  const handleLastRowVisible = async () => {
    if (hasMoreCalendarEvents) {
      await fetchMoreRecords();
    }
  };

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />

      <WidgetHeaderCountEffect count={totalNumberOfCalendarEvents} />
      <CalendarEventsDateRangeFilter
        instanceId={targetRecord.id}
        preset={dateRangePreset}
        customDateRange={customDateRange}
        onPresetChange={setDateRangePreset}
        onCustomDateRangeChange={setCustomDateRange}
      />
      <CalendarEventsCardContent
        firstQueryLoading={firstQueryLoading}
        isDateRangeFiltered={isDateRangeFiltered}
        isFetchingMore={isFetchingMore}
        objectName={targetRecord.targetObjectNameSingular}
        onLastRowVisible={handleLastRowVisible}
        timelineCalendarEvents={timelineCalendarEvents}
      />
    </>
  );
};
