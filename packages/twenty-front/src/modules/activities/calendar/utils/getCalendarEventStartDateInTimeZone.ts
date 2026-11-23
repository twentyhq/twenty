import { Temporal } from 'temporal-polyfill';

export const getCalendarEventStartDateInTimeZone = ({
  startsAt,
  isFullDay,
  timeZone,
}: {
  startsAt: string;
  isFullDay: boolean;
  timeZone: string;
}) =>
  isFullDay
    ? startsAt.slice(0, 10)
    : Temporal.Instant.from(startsAt)
        .toZonedDateTimeISO(timeZone)
        .toPlainDate()
        .toString();
