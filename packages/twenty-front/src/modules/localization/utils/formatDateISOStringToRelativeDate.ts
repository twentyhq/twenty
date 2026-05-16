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

export const formatDateISOStringToRelativeDate = ({
  isoDate,
  isDayMaximumPrecision = false,
  localeCatalog,
}: {
  isoDate: string;
  isDayMaximumPrecision?: boolean;
  localeCatalog: Locale;
}) => {
  const now = new Date();
  // Date-only strings (YYYY-MM-DD) are parsed as UTC midnight per the ECMAScript
  // spec, which shifts them to the previous calendar day for users west of UTC.
  // Appending T00:00:00 (no Z) forces local-time parsing instead.
  const targetDate =
    isoDate.length === 10 ? new Date(isoDate + 'T00:00:00') : new Date(isoDate);

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
