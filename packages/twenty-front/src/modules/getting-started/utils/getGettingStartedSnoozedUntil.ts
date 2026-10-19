import { doNotTranslate } from 'twenty-shared/i18n';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export type GettingStartedSnooze = 'hour' | 'tomorrow' | 'lastThreeDays';

export const getGettingStartedSnoozedUntil = ({
  option,
  now,
  timeZone,
  trialEnd,
}: {
  option: GettingStartedSnooze;
  now: Date;
  timeZone: string;
  trialEnd: Date | null;
}): string | null => {
  if (option === 'hour')
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  if (option === 'lastThreeDays') {
    if (trialEnd === null) return null;
    const target = new Date(trialEnd.getTime() - 72 * 60 * 60 * 1000);
    return target > now ? target.toISOString() : null;
  }
  const localDay = formatInTimeZone(
    now,
    timeZone,
    doNotTranslate('yyyy-MM-dd'),
  );
  const date = new Date(doNotTranslate(`${localDay}T12:00:00Z`));
  date.setUTCDate(date.getUTCDate() + 1);
  const nextDay = date.toISOString().slice(0, 10);
  return fromZonedTime(
    doNotTranslate(`${nextDay}T00:00:00`),
    timeZone,
  ).toISOString();
};
