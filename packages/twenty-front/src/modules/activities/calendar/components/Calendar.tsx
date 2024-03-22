import { useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { format, getYear } from 'date-fns';
import { useRecoilState } from 'recoil';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEventStates } from '@/activities/calendar/hooks/internal/useCalendarEventStates';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { getTimelineCalendarEventsFromCompanyId } from '@/activities/calendar/queries/getCalendarEventsFromCompanyId';
import { getTimelineCalendarEventsFromPersonId } from '@/activities/calendar/queries/getCalendarEventsFromPersonId';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { H3Title } from '@/ui/display/typography/components/H3Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { Section } from '@/ui/layout/section/components/Section';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import {
  GetTimelineCalendarEventsFromPersonIdQueryVariables,
  TimelineCalendarEventsWithTotal,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledYear = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

export const Calendar = ({ entity }: { entity: ActivityTargetableObject }) => {
  const { enqueueSnackBar } = useSnackBar();

  const { calendarEventsPageState } = useCalendarEventStates({
    calendarEventScopeId: getScopeIdFromComponentId(entity.id),
  });

  const [calendarEventsPage, setCalendarEventsPage] = useRecoilState(
    calendarEventsPageState,
  );

  const [isFetchingMoreEvents, setIsFetchingMoreEvents] = useState(false);

  const [threadQuery, queryName] =
    entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? [
          getTimelineCalendarEventsFromPersonId,
          'getTimelineCalendarEventsFromPersonId',
        ]
      : [
          getTimelineCalendarEventsFromCompanyId,
          'getTimelineCalendarEventsFromCompanyId',
        ];

  const threadQueryVariables = {
    ...(entity.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? { personId: entity.id }
      : { companyId: entity.id }),
    page: 1,
    pageSize: TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  } as GetTimelineCalendarEventsFromPersonIdQueryVariables;

  const {
    data,
    loading: firstQueryLoading,
    fetchMore,
  } = useQuery(threadQuery, {
    variables: threadQueryVariables,
    onError: (error) => {
      enqueueSnackBar(error.message || 'Error loading event threads', {
        variant: 'error',
      });
    },
  });

  const fetchMoreRecords = async () => {
    if (
      calendarEventsPage.hasNextPage &&
      !isFetchingMoreEvents &&
      !firstQueryLoading
    ) {
      setIsFetchingMoreEvents(true);

      await fetchMore({
        variables: {
          ...threadQueryVariables,
          page: calendarEventsPage.pageNumber + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.[queryName]?.timelineThreads?.length) {
            setCalendarEventsPage((calendarEventsPage) => ({
              ...calendarEventsPage,
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
      setCalendarEventsPage((calendarEventsPage) => ({
        ...calendarEventsPage,
        pageNumber: calendarEventsPage.pageNumber + 1,
      }));
      setIsFetchingMoreEvents(false);
    }
  };

  const {
    totalNumberOfCalendarEvents,
    timelineCalendarEvents,
  }: TimelineCalendarEventsWithTotal = data?.[queryName] ?? [];

  const {
    calendarEventsByDayTime,
    currentCalendarEvent,
    daysByMonthTime,
    getNextCalendarEvent,
    monthTimes,
    monthTimesByYear,
    updateCurrentCalendarEvent,
  } = useCalendarEvents(timelineCalendarEvents);

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
            No events have been scheduled with this record yet.
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
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
