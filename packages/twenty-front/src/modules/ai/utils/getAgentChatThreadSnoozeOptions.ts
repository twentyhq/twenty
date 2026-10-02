import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Temporal } from 'temporal-polyfill';

export type AgentChatThreadSnoozeOption = {
  key: 'laterToday' | 'thisEvening' | 'tomorrow' | 'nextWeek';
  label: MessageDescriptor;
  date: Date;
};

const EVENING_HOUR = 18;
const MORNING_HOUR = 9;
const LATER_TODAY_HOURS = 3;
const MONDAY = 1;
const DAYS_IN_WEEK = 7;

const atHour = (dateTime: Temporal.ZonedDateTime, hour: number) =>
  dateTime.with({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });

const startOfHour = (dateTime: Temporal.ZonedDateTime) =>
  dateTime.round({ smallestUnit: 'hour', roundingMode: 'floor' });

const isSameDay = (
  first: Temporal.ZonedDateTime,
  second: Temporal.ZonedDateTime,
) => first.toPlainDate().equals(second.toPlainDate());

// An option that is already behind, or that lands on the same moment as
// another, is left out rather than shown twice.
export const getAgentChatThreadSnoozeOptions = ({
  now: instant,
  timeZone,
}: {
  now: Date;
  timeZone: string;
}): AgentChatThreadSnoozeOption[] => {
  // Worked out on the member's clock, which can differ from the browser's
  const now = Temporal.Instant.fromEpochMilliseconds(
    instant.getTime(),
  ).toZonedDateTimeISO(timeZone);
  const thisEvening = atHour(now, EVENING_HOUR);
  // Rounded to a round hour, the way a person would say it: up, unless that
  // would push it into tomorrow
  const laterTodayRoundedUp = startOfHour(
    now.add({
      hours: LATER_TODAY_HOURS + (now.minute > 0 ? 1 : 0),
    }),
  );
  const laterToday = isSameDay(laterTodayRoundedUp, now)
    ? laterTodayRoundedUp
    : startOfHour(now.add({ hours: LATER_TODAY_HOURS }));
  const dayAfter = now.add({ days: 1 });
  const tomorrow = atHour(dayAfter, MORNING_HOUR);
  // From Sunday, next Monday is tomorrow, so next week starts the Monday after
  const nextWeek = atHour(
    dayAfter.add({
      days:
        (MONDAY - dayAfter.dayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK ||
        DAYS_IN_WEEK,
    }),
    MORNING_HOUR,
  );

  const candidates = [
    { key: 'thisEvening', label: msg`This evening`, dateTime: thisEvening },
    { key: 'laterToday', label: msg`Later today`, dateTime: laterToday },
    { key: 'tomorrow', label: msg`Tomorrow`, dateTime: tomorrow },
    { key: 'nextWeek', label: msg`Next week`, dateTime: nextWeek },
  ] as const;

  return candidates
    .filter(
      (option, index) =>
        Temporal.ZonedDateTime.compare(option.dateTime, now) > 0 &&
        (option.key !== 'laterToday' || isSameDay(option.dateTime, now)) &&
        candidates
          .slice(0, index)
          .every((earlier) => !earlier.dateTime.equals(option.dateTime)),
    )
    .sort((first, second) =>
      Temporal.ZonedDateTime.compare(first.dateTime, second.dateTime),
    )
    .map(({ key, label, dateTime }) => ({
      key,
      label,
      date: new Date(dateTime.epochMilliseconds),
    }));
};
