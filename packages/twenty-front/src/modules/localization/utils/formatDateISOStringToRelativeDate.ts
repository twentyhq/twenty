import { t } from '@lingui/core/macro';
import { formatDistance, type Locale } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { isDateWithoutTime } from 'twenty-shared/utils';

export const formatDateISOStringToRelativeDate = ({
  isoDate,
  localeCatalog,
  timeZone,
  isDayMaximumPrecision = false,
}: {
  isoDate: string;
  localeCatalog: Locale;
  isDayMaximumPrecision?: boolean;
  timeZone: string;
}) => {
  const formatRelative = (targetMs: number, baseMs: number) =>
    formatDistance(targetMs, baseMs, {
      addSuffix: true,
      locale: localeCatalog,
    });

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

    return formatRelative(
      targetPlainDate.toZonedDateTime(timeZone).epochMilliseconds,
      todayPlainDate.toZonedDateTime(timeZone).epochMilliseconds,
    );
  }

  const now = Temporal.Now.zonedDateTimeISO(timeZone);
  const target = Temporal.Instant.from(isoDate).toZonedDateTimeISO(timeZone);
  const isWithin24h =
    Math.abs(target.until(now, { largestUnit: 'day' }).days) < 1;

  if (isDayMaximumPrecision || !isWithin24h) {
    return formatRelative(
      target.startOfDay().epochMilliseconds,
      now.startOfDay().epochMilliseconds,
    );
  }

  return formatRelative(target.epochMilliseconds, now.epochMilliseconds);
};
