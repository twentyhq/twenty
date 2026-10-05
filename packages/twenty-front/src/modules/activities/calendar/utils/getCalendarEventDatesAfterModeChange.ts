import { Temporal } from 'temporal-polyfill';

export const getCalendarEventDatesAfterModeChange = ({
  dates,
  isFullDay,
  timeZone,
}: {
  dates: { startsAt: string; endsAt: string };
  isFullDay: boolean;
  timeZone: string;
}) => {
  if (isFullDay) {
    const startDate = Temporal.Instant.from(dates.startsAt)
      .toZonedDateTimeISO(timeZone)
      .toPlainDate();

    return {
      startsAt: startDate.toString(),
      endsAt: startDate.add({ days: 1 }).toString(),
    };
  }

  const startDate = Temporal.PlainDate.from(dates.startsAt.slice(0, 10));
  const startsAt = startDate.toZonedDateTime({
    timeZone,
    plainTime: Temporal.PlainTime.from('09:00'),
  });

  return {
    startsAt: startsAt.toInstant().toString(),
    endsAt: startsAt.add({ hours: 1 }).toInstant().toString(),
  };
};
