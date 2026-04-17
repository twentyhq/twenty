import { t } from '@lingui/core/macro';
import {
  differenceInDays,
  formatDistance,
  type Locale,
  startOfDay,
} from 'date-fns';
import { Temporal } from 'temporal-polyfill';

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

  if (isDayMaximumPrecision && isoDate.length === 10) {
    const targetPlainDate = Temporal.PlainDate.from(isoDate);
    const todayPlainDate = Temporal.Now.plainDateISO();
    const diffDays = todayPlainDate.until(targetPlainDate).days;

    if (diffDays === 0) return t`Today`;
    if (diffDays === -1) return t`Yesterday`;
    if (diffDays === 1) return t`Tomorrow`;

    return formatDistance(
      startOfDay(new Date(isoDate + 'T00:00:00')),
      startOfDay(now),
      { addSuffix: true, locale: localeCatalog },
    );
  }

  const targetDate = new Date(isoDate);
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
