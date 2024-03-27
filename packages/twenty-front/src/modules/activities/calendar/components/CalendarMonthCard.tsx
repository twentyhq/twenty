import { useContext } from 'react';
import styled from '@emotion/styled';
import { Card } from 'twenty-ui';

import { CalendarDayCardContent } from '@/activities/calendar/components/CalendarDayCardContent';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';

type CalendarMonthCardProps = {
  dayTimes: number[];
};

const StyledCard = styled(Card)`
  overflow: visible;
`;

export const CalendarMonthCard = ({ dayTimes }: CalendarMonthCardProps) => {
  const { calendarEventsByDayTime } = useContext(CalendarContext);

  return (
    <StyledCard fullWidth>
      {dayTimes.map((dayTime, index) => {
        const dayCalendarEvents = calendarEventsByDayTime[dayTime] || [];

        return (
          <CalendarDayCardContent
            key={dayTime}
            calendarEvents={dayCalendarEvents}
            divider={index < dayTimes.length - 1}
          />
        );
      })}
    </StyledCard>
  );
};
