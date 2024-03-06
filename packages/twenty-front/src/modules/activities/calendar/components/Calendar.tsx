import styled from '@emotion/styled';
import { startOfMonth } from 'date-fns';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { mockedCalendarEvents } from '~/testing/mock-data/calendar';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

export const Calendar = () => {
  const sortedCalendarEvents = mockedCalendarEvents.sort(
    (eventA, eventB) => eventB.startsAt.getTime() - eventA.startsAt.getTime(),
  );
  const calendarEventsByMonthTime = groupArrayItemsBy(
    sortedCalendarEvents,
    ({ startsAt }) => startOfMonth(startsAt).getTime(),
  );
  const sortedMonthTimes = Object.keys(calendarEventsByMonthTime).sort(
    (timeA, timeB) => +timeB - +timeA,
  );

  return (
    <StyledContainer>
      {sortedMonthTimes.map((monthTime) => {
        const monthCalendarEvents = calendarEventsByMonthTime[+monthTime];

        return (
          !!monthCalendarEvents?.length && (
            <CalendarMonthCard
              key={monthTime}
              calendarEvents={monthCalendarEvents}
            />
          )
        );
      })}
    </StyledContainer>
  );
};
