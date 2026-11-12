import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Locale } from 'date-fns';

import { type CronDescriptionOptions } from '~/utils/cron-to-human/types/CronDescriptionOptions';

import { getDayOfMonthDescription } from './getDayOfMonthDescription';
import { getDayOfWeekDescription } from './getDayOfWeekDescription';

export const getDaysDescription = ({
  dayOfMonth,
  dayOfWeek,
  options,
  localeCatalog,
}: {
  dayOfMonth: string;
  dayOfWeek: string;
  options: CronDescriptionOptions;
  localeCatalog?: Locale;
}): string => {
  const dayOfMonthDescription = getDayOfMonthDescription(dayOfMonth, options);

  if (dayOfMonth === '*' || !isNonEmptyString(dayOfMonthDescription)) {
    return getDayOfWeekDescription(dayOfWeek, options, localeCatalog);
  }

  const dayOfWeekDescription = getDayOfWeekDescription(
    dayOfWeek,
    { ...options, isCombinedWithDayOfMonth: true },
    localeCatalog,
  );

  if (!isNonEmptyString(dayOfWeekDescription)) {
    return dayOfMonthDescription;
  }

  // Cron runs on days matching either field, so neither part narrows the other
  return t`${dayOfMonthDescription} and ${dayOfWeekDescription}`;
};
