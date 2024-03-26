import styled from '@emotion/styled';
import { format, getYear } from 'date-fns';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { getTimelineCalendarEventsFromCompanyId } from '@/activities/calendar/queries/getTimelineCalendarEventsFromCompanyId';
import { getTimelineCalendarEventsFromPersonId } from '@/activities/calendar/queries/getTimelineCalendarEventsFromPersonId';
import { FetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { H3Title } from '@/ui/display/typography/components/H3Title';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { Section } from '@/ui/layout/section/components/Section';
import { TimelineCalendarEventsWithTotal } from '~/generated/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  overflow: scroll;
`;

const StyledYear = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

export const Calendar = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const [query, queryName] =
    targetableObject.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? [
          getTimelineCalendarEventsFromPersonId,
          'getTimelineCalendarEventsFromPersonId',
        ]
      : [
          getTimelineCalendarEventsFromCompanyId,
          'getTimelineCalendarEventsFromCompanyId',
        ];

  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords } =
    useCustomResolver<TimelineCalendarEventsWithTotal>(
      query,
      queryName,
      'timelineCalendarEvents',
      targetableObject,
      TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
    );

  const { timelineCalendarEvents } = data?.[queryName] ?? {};

  const {
    calendarEventsByDayTime,
    currentCalendarEvent,
    daysByMonthTime,
    getNextCalendarEvent,
    monthTimes,
    monthTimesByYear,
    updateCurrentCalendarEvent,
  } = useCalendarEvents(timelineCalendarEvents || []);

  if (firstQueryLoading) {
    // TODO: implement loader
    return;
  }

  if (!firstQueryLoading && !timelineCalendarEvents?.length) {
    // TODO: change animated placeholder
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noMatchRecord" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No Events
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            No events have been scheduled with this{' '}
            {targetableObject.targetObjectNameSingular} yet.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <CalendarContext.Provider
      value={{
        calendarEventsByDayTime,
        currentCalendarEvent,
        displayCurrentEventCursor: true,
        getNextCalendarEvent,
        updateCurrentCalendarEvent,
      }}
    >
      <StyledContainer>
        {monthTimes.map((monthTime) => {
          const monthDayTimes = daysByMonthTime[monthTime] || [];
          const year = getYear(monthTime);
          const lastMonthTimeOfYear = monthTimesByYear[year]?.[0];
          const isLastMonthOfYear = lastMonthTimeOfYear === monthTime;
          const monthLabel = format(monthTime, 'MMMM');

          return (
            <Section key={monthTime}>
              <H3Title
                title={
                  <>
                    {monthLabel}
                    {isLastMonthOfYear && <StyledYear> {year}</StyledYear>}
                  </>
                }
              />
              <CalendarMonthCard dayTimes={monthDayTimes} />
            </Section>
          );
        })}
        <FetchMoreLoader
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={fetchMoreRecords}
        />
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
