import styled from '@emotion/styled';
import { format, getYear } from 'date-fns';
import { H3Title } from 'twenty-ui';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { getTimelineCalendarEventsFromCompanyId } from '@/activities/calendar/queries/getTimelineCalendarEventsFromCompanyId';
import { getTimelineCalendarEventsFromPersonId } from '@/activities/calendar/queries/getTimelineCalendarEventsFromPersonId';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
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

  const { timelineCalendarEvents, totalNumberOfCalendarEvents } =
    data?.[queryName] ?? {};
  const hasMoreCalendarEvents =
    timelineCalendarEvents && totalNumberOfCalendarEvents
      ? timelineCalendarEvents?.length < totalNumberOfCalendarEvents
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreCalendarEvents) {
      await fetchMoreRecords();
    }
  };

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
    return <SkeletonLoader />;
  }

  if (!firstQueryLoading && !timelineCalendarEvents?.length) {
    // TODO: change animated placeholder
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
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
        <CustomResolverFetchMoreLoader
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={handleLastRowVisible}
        />
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
