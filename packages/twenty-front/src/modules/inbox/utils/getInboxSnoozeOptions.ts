import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  addDays,
  addHours,
  getMinutes,
  isSameDay,
  nextMonday,
  set,
  startOfHour,
} from 'date-fns';

export type InboxSnoozeOption = {
  key: 'laterToday' | 'thisEvening' | 'tomorrow' | 'nextWeek';
  label: MessageDescriptor;
  date: Date;
};

const EVENING_HOUR = 18;
const MORNING_HOUR = 9;
const LATER_TODAY_HOURS = 3;

const atHour = (date: Date, hour: number) =>
  set(date, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });

// An option that is already behind, or that lands on the same moment as
// another, is left out rather than shown twice.
export const getInboxSnoozeOptions = (now: Date): InboxSnoozeOption[] => {
  const thisEvening = atHour(now, EVENING_HOUR);
  // Rounded up to a round hour, the way a person would say it.
  const laterToday = startOfHour(
    addHours(now, LATER_TODAY_HOURS + (getMinutes(now) > 0 ? 1 : 0)),
  );
  const tomorrow = atHour(addDays(now, 1), MORNING_HOUR);
  const nextWeek = atHour(nextMonday(now), MORNING_HOUR);

  const candidates: InboxSnoozeOption[] = [
    { key: 'thisEvening', label: msg`This evening`, date: thisEvening },
    { key: 'laterToday', label: msg`Later today`, date: laterToday },
    { key: 'tomorrow', label: msg`Tomorrow`, date: tomorrow },
    { key: 'nextWeek', label: msg`Next week`, date: nextWeek },
  ];

  return candidates
    .filter(
      (option, index) =>
        option.date > now &&
        (option.key !== 'laterToday' || isSameDay(option.date, now)) &&
        candidates
          .slice(0, index)
          .every((earlier) => earlier.date.getTime() !== option.date.getTime()),
    )
    .sort((first, second) => first.date.getTime() - second.date.getTime());
};
