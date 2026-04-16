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
  
  // Check if the input is a date-only ISO string (YYYY-MM-DD format)
  // Date-only strings should be interpreted in local timezone, not UTC
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoDate);
  
  const targetDate = isDateOnly
    ? new Date(isoDate + 'T00:00:00') // Parse as local midnight
    : new Date(isoDate);

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
