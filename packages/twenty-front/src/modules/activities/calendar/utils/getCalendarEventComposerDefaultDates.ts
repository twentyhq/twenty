import type { Temporal } from 'temporal-polyfill';

const CALENDAR_EVENT_DEFAULT_DURATION_MINUTES = 60;
const CALENDAR_EVENT_START_INTERVAL_MINUTES = 30;

export const getCalendarEventComposerDefaultDates = ({
  now,
  timeZone,
}: {
  now: Temporal.Instant;
  timeZone: string;
}) => {
  const zonedNow = now.toZonedDateTimeISO(timeZone);
  const minutesUntilNextInterval =
    CALENDAR_EVENT_START_INTERVAL_MINUTES -
    (zonedNow.minute % CALENDAR_EVENT_START_INTERVAL_MINUTES);

  const startsAt = zonedNow
    .add({ minutes: minutesUntilNextInterval })
    .with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });

  return {
    startsAt: startsAt.toInstant().toString(),
    endsAt: startsAt
      .add({ minutes: CALENDAR_EVENT_DEFAULT_DURATION_MINUTES })
      .toInstant()
      .toString(),
  };
};
