import { t } from '@lingui/core/macro';
import {
  differenceInDays,
  formatDistance,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
} from 'date-fns';

export const formatDateISOStringToRelativeDate = ({
  isoDate,
  isDayMaximumPrecision = false,
  locale,
}: {
  isoDate: string;
  isDayMaximumPrecision?: boolean;
  locale?: Locale;
}) => {
  const now = new Date();
  const targetDate = new Date(isoDate);

  if (isDayMaximumPrecision && isToday(targetDate)) return t`Today`;
  if (isDayMaximumPrecision && isYesterday(targetDate)) return t`Yesterday`;
  if (isDayMaximumPrecision && isTomorrow(targetDate)) return t`Tomorrow`;

  const isWithin24h = Math.abs(differenceInDays(targetDate, now)) < 1;

  if (isDayMaximumPrecision || !isWithin24h)
    return formatDistance(startOfDay(targetDate), startOfDay(now), {
      addSuffix: true,
      locale,
    });

  return formatDistance(targetDate, now, {
    addSuffix: true,
    locale,
  });
};
