import styled from '@emotion/styled';
import { format, getYear } from 'date-fns';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { H3Title } from '@/ui/display/typography/components/H3Title';
import { Section } from '@/ui/layout/section/components/Section';

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
  const { records: calendarEvents } = useFindManyRecords<CalendarEvent>({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    orderBy: { startsAt: 'DescNullsLast', endsAt: 'DescNullsLast' },
    useRecordsWithoutConnection: true,
  });

  const {
    calendarEventsByDayTime,
    currentCalendarEvent,
    daysByMonthTime,
    getNextCalendarEvent,
    monthTimes,
    monthTimesByYear,
    updateCurrentCalendarEvent,
  } = useCalendarEvents(
    calendarEvents.map((calendarEvent) => ({
      ...calendarEvent,
      // TODO: retrieve CalendarChannel visibility from backend
      visibility: 'SHARE_EVERYTHING',
    })),
  );

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
