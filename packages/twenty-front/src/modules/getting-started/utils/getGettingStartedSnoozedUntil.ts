import { addHours, isAfter, subHours } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { getNextPeriodStart, isDefined } from 'twenty-shared/utils';

import { GETTING_STARTED_LAST_DAYS_SNOOZE_HOURS } from '@/getting-started/constants/GettingStartedLastDaysSnoozeHours';
import { type GettingStartedSnoozeOption } from '@/getting-started/types/GettingStartedSnoozeOption';

export const getGettingStartedSnoozedUntil = ({
  option,
  now,
  timeZone,
  trialEnd,
}: {
  option: GettingStartedSnoozeOption;
  now: Date;
  timeZone: string;
  trialEnd: Date | null;
}): string | null => {
  if (option === 'hour') {
    return addHours(now, 1).toISOString();
  }

  if (option === 'lastThreeDays') {
    if (!isDefined(trialEnd)) {
      return null;
    }

    const lastThreeDaysStart = subHours(
      trialEnd,
      GETTING_STARTED_LAST_DAYS_SNOOZE_HOURS,
    );

    return isAfter(lastThreeDaysStart, now)
      ? lastThreeDaysStart.toISOString()
      : null;
  }

  const nextLocalMidnight = getNextPeriodStart(
    Temporal.Instant.fromEpochMilliseconds(now.getTime()).toZonedDateTimeISO(
      timeZone,
    ),
    'DAY',
  );

  return new Date(nextLocalMidnight.epochMilliseconds).toISOString();
};
