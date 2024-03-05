import { compareDesc, startOfDay } from 'date-fns';

import { CalendarDayCardContent } from '@/activities/calendar/components/CalendarDayCardContent';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { Card } from '@/ui/layout/card/components/Card';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';

type CalendarMonthCardProps = {
  calendarEvents: CalendarEvent[];
};

export const CalendarMonthCard = ({
  calendarEvents,
}: CalendarMonthCardProps) => {
  const calendarEventsByDayDate = groupArrayItemsBy(
    calendarEvents,
    ({ startDate }) => startOfDay(startDate).toISOString(),
  );
  const sortedDayDates = Object.keys(calendarEventsByDayDate).sort(
    ([dateISOStringA], [dateISOStringB]) =>
      compareDesc(new Date(dateISOStringA), new Date(dateISOStringB)),
  );

  return (
    <Card fullWidth>
      {sortedDayDates.map((dayDate, index) => {
        const dayCalendarEvents = calendarEventsByDayDate[dayDate];

        return (
          !!dayCalendarEvents?.length && (
            <CalendarDayCardContent
              key={dayDate}
              calendarEvents={dayCalendarEvents}
              divider={index < sortedDayDates.length - 1}
            />
          )
        );
      })}
    </Card>
  );
};
