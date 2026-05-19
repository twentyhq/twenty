import { t } from '@lingui/core/macro';
import {
  differenceInDays,
  formatDistance,
  isToday,
  isTomorrow,
  isYesterday,
  type Locale,
  startOfDay,
} from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { isDateWithoutTime } from 'twenty-shared/utils';

export const formatDateISOStringToRelativeDate = ({
  isoDate,
  isDayMaximumPrecision = false,
  localeCatalog,
  timeZone,
}: {
  isoDate: string;
  isDayMaximumPrecision?: boolean;
  localeCatalog: Locale;
  timeZone: string;
}) => {
  // Date-only ISO strings (e.g. "2022-01-01") represent calendar dates with no
  // time component, so compare them as Temporal PlainDates anchored in the
  // user's timezone. Bypassing date-fns's day-boundary helpers (isToday etc.)
  // here is required because those evaluate boundaries in the machine's local
  // timezone, which leads to off-by-one days when the user's timezone differs
  // from the machine's (e.g. machine in UTC-5, user in UTC: a date-only value
  // like "2026-05-19" would otherwise resolve as "Today" instead of "Tomorrow"
  // when the actual moment is May 18 13:00 UTC).
  if (isDateWithoutTime(isoDate)) {
    const targetPlainDate = Temporal.PlainDate.from(isoDate);
    const todayPlainDate = Temporal.Now.plainDateISO(timeZone);
    const dayDiff = todayPlainDate.until(targetPlainDate, {
      largestUnit: 'day',
    }).days;

    if (isDayMaximumPrecision) {
      if (dayDiff === 0) return t`Today`;
      if (dayDiff === -1) return t`Yesterday`;
      if (dayDiff === 1) return t`Tomorrow`;
    }

    // Anchor both PlainDates as midnight UTC so that date-fns formatDistance
    // sees an exact day-aligned offset between them. The machine timezone
    // shifts both Date objects by the same amount, so the diff is preserved.
    return formatDistance(
      new Date(`${targetPlainDate.toString()}T00:00:00Z`),
      new Date(`${todayPlainDate.toString()}T00:00:00Z`),
      { addSuffix: true, locale: localeCatalog },
    );
  }

  const now = new Date();
  const targetDate = new Date(isoDate);

  if (isDayMaximumPrecision && isToday(targetDate)) return t`Today`;
  if (isDayMaximumPrecision && isYesterday(targetDate)) return t`Yesterday`;
  if (isDayMaximumPrecision && isTomorrow(targetDate)) return t`Tomorrow`;

  const isWithin24h = Math.abs(differenceInDays(targetDate, now)) < 1;

  if (isDayMaximumPrecision || !isWithin24h)
    return formatDistance(startOfDay(targetDate), startOfDay(now), {
      addSuffix: true,
      locale: localeCatalog,
    });

  return formatDistance(targetDate, now, {
    addSuffix: true,
    locale: localeCatalog,
  });
};
