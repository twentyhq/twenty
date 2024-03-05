import styled from '@emotion/styled';
import { compareDesc, startOfMonth } from 'date-fns';

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
  const calendarEventsByMonthDate = groupArrayItemsBy(
    mockedCalendarEvents,
    ({ startDate }) => startOfMonth(startDate).toISOString(),
  );
  const sortedMonthDates = Object.keys(calendarEventsByMonthDate).sort(
    ([dateISOStringA], [dateISOStringB]) =>
      compareDesc(new Date(dateISOStringA), new Date(dateISOStringB)),
  );

  return (
    <StyledContainer>
      {sortedMonthDates.map((monthDate) => {
        const monthCalendarEvents = calendarEventsByMonthDate[monthDate];

        return (
          !!monthCalendarEvents?.length && (
            <CalendarMonthCard
              key={monthDate}
              calendarEvents={monthCalendarEvents}
            />
          )
        );
      })}
    </StyledContainer>
  );
};
