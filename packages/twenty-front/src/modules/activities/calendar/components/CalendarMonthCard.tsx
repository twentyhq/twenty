import { startOfDay } from 'date-fns';

import { CalendarDayCardContent } from '@/activities/calendar/components/CalendarDayCardContent';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { Card } from '@/ui/layout/card/components/Card';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';
import { sortDesc } from '~/utils/sort';

type CalendarMonthCardProps = {
  calendarEvents: CalendarEvent[];
};

export const CalendarMonthCard = ({
  calendarEvents,
}: CalendarMonthCardProps) => {
  const calendarEventsByDayTime = groupArrayItemsBy(
    calendarEvents,
    ({ startsAt }) => startOfDay(startsAt).getTime(),
  );
  const sortedDayTimes = Object.keys(calendarEventsByDayTime)
    .map(Number)
    .sort(sortDesc);

  return (
    <Card fullWidth>
      {sortedDayTimes.map((dayTime, index) => {
        const dayCalendarEvents = calendarEventsByDayTime[dayTime];

        return (
          !!dayCalendarEvents?.length && (
            <CalendarDayCardContent
              key={dayTime}
              calendarEvents={dayCalendarEvents}
              divider={index < sortedDayTimes.length - 1}
            />
          )
        );
      })}
    </Card>
  );
};
