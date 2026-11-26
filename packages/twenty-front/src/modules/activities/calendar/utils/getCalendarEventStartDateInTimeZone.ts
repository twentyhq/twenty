import { Temporal } from 'temporal-polyfill';

export const getCalendarEventStartDateInTimeZone = ({
  startsAt,
  isFullDay,
  timeZone,
}: {
  startsAt: string;
  isFullDay: boolean;
  timeZone: string;
}) => {
  if (isFullDay) {
    return startsAt.slice(0, 10);
  }

  const startsAtInTimeZone =
    Temporal.Instant.from(startsAt).toZonedDateTimeISO(timeZone);

  return startsAtInTimeZone.toPlainDate().toString();
};
