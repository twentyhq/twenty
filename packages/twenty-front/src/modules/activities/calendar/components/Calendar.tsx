import styled from '@emotion/styled';
import { format, getYear } from 'date-fns';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { sortCalendarEventsDesc } from '@/activities/calendar/utils/sortCalendarEvents';
import { H3Title } from '@/ui/display/typography/components/H3Title';
import { Section } from '@/ui/layout/section/components/Section';
import { mockedCalendarEvents } from '~/testing/mock-data/calendar';

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

export const Calendar = () => {
  const sortedCalendarEvents = [...mockedCalendarEvents].sort(
    sortCalendarEventsDesc,
  );

  const {
    calendarEventsByDayTime,
    currentCalendarEvent,
    daysByMonthTime,
    getNextCalendarEvent,
    monthTimes,
    monthTimesByYear,
    updateCurrentCalendarEvent,
  } = useCalendarEvents(sortedCalendarEvents);

  return (
    <CalendarContext.Provider
      value={{
        calendarEventsByDayTime,
        currentCalendarEvent,
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
