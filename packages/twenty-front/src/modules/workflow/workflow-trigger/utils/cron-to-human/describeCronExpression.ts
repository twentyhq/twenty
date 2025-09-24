import { t } from '@lingui/core/macro';
import { type Locale } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { getDayOfMonthDescription } from './descriptors/getDayOfMonthDescription';
import { getDayOfWeekDescription } from './descriptors/getDayOfWeekDescription';
import { getHoursDescription } from './descriptors/getHoursDescription';
import { getMinutesDescription } from './descriptors/getMinutesDescription';
import { getMonthsDescription } from './descriptors/getMonthsDescription';
import {
  type CronDescriptionOptions,
  DEFAULT_CRON_DESCRIPTION_OPTIONS,
} from './types/cronDescriptionOptions';
import { parseCronExpression } from './utils/parseCronExpression';

export const describeCronExpression = (
  expression: string,
  options: CronDescriptionOptions = DEFAULT_CRON_DESCRIPTION_OPTIONS,
  localeCatalog?: Locale,
): string => {
  if (!isDefined(expression) || expression.trim() === '') {
    throw new Error('Cron expression is required');
  }

  try {
    const parts = parseCronExpression(expression);
    const mergedOptions = { ...DEFAULT_CRON_DESCRIPTION_OPTIONS, ...options };

    const descriptions: string[] = [];

    // Prioritize minutes over hours for step values like */5
    const minutesDescription = getMinutesDescription(
      parts.minutes,
      mergedOptions,
    );
    const hoursDescription = getHoursDescription(
      parts.hours,
      parts.minutes,
      mergedOptions,
    );

    if (
      isDefined(minutesDescription) &&
      minutesDescription !== '' &&
      parts.minutes !== '0'
    ) {
      descriptions.push(minutesDescription);
    } else if (isDefined(hoursDescription) && hoursDescription !== '') {
      descriptions.push(hoursDescription);
    }
    const dayOfMonthDesc = getDayOfMonthDescription(
      parts.dayOfMonth,
      mergedOptions,
    );
    const dayOfWeekDesc = getDayOfWeekDescription(
      parts.dayOfWeek,
      mergedOptions,
      localeCatalog,
    );

    if (
      isDefined(dayOfMonthDesc) &&
      dayOfMonthDesc !== '' &&
      parts.dayOfMonth !== '*'
    ) {
      descriptions.push(dayOfMonthDesc);
    } else if (
      isDefined(dayOfWeekDesc) &&
      dayOfWeekDesc !== '' &&
      parts.dayOfWeek !== '*'
    ) {
      descriptions.push(dayOfWeekDesc);
    }
    const monthsDesc = getMonthsDescription(
      parts.month,
      mergedOptions,
      localeCatalog,
    );
    if (isDefined(monthsDesc) && monthsDesc !== '') {
      descriptions.push(monthsDesc);
    }

    if (descriptions.length === 0) {
      return t`every minute`;
    }
    // Simple joining - just use spaces, no commas for cleaner descriptions
    return descriptions.join(' ');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to describe cron expression: ${errorMessage}`);
  }
};
