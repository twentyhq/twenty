import { useContext } from 'react';

import { CalendarDayCardContent } from '@/activities/calendar/components/CalendarDayCardContent';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { Card } from 'twenty-ui';

type CalendarMonthCardProps = {
  dayTimes: number[];
};

export const CalendarMonthCard = ({ dayTimes }: CalendarMonthCardProps) => {
  const { calendarEventsByDayTime } = useContext(CalendarContext);

  return (
    <Card fullWidth>
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
    </Card>
  );
};
