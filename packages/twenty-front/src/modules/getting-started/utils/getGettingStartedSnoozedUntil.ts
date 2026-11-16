import { Temporal } from 'temporal-polyfill';
import { doNotTranslate } from 'twenty-shared/i18n';
import { getNextPeriodStart } from 'twenty-shared/utils';

export const getGettingStartedSnoozedUntil = ({
  now,
  timeZone,
}: {
  now: Date;
  timeZone: string;
}): string => {
  const nextLocalMidnight = getNextPeriodStart(
    Temporal.Instant.fromEpochMilliseconds(now.getTime()).toZonedDateTimeISO(
      timeZone,
    ),
    doNotTranslate('DAY'),
  );

  return new Date(nextLocalMidnight.epochMilliseconds).toISOString();
};
