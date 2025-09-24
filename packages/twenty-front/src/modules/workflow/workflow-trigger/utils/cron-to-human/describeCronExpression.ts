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

    // Smart priority: Use hours description when we have specific hours,
    // otherwise use minutes description for patterns like */5
    const hoursDescription = getHoursDescription(
      parts.hours,
      parts.minutes,
      mergedOptions,
    );
    const minutesDescription = getMinutesDescription(
      parts.minutes,
      mergedOptions,
    );

    // Smart logic for time descriptions
    if (parts.minutes.includes('/') && parts.hours.includes('-')) {
      // Special case: minute intervals with hour ranges (e.g., "*/15 9-17")
      if (isDefined(minutesDescription) && minutesDescription !== '') {
        descriptions.push(minutesDescription);
      }
      if (isDefined(hoursDescription) && hoursDescription !== '') {
        // Remove "at" prefix from hours description when combining
        const cleanHoursDesc = hoursDescription.replace(/^at\s+/, '');
        descriptions.push(cleanHoursDesc);
      }
    } else if (
      parts.hours === '*' &&
      (parts.minutes.includes('/') ||
        parts.minutes.includes('-') ||
        parts.minutes === '*')
    ) {
      // Pattern like "*/5 * * * *", "15-45 * * * *", or "* * * * *" - prioritize minutes
      if (isDefined(minutesDescription) && minutesDescription !== '') {
        descriptions.push(minutesDescription);
      }
    } else if (parts.hours === '*' && parts.minutes === '0') {
      // Pattern like "0 * * * *" - should be "every hour", not "at the top of the hour"
      descriptions.push(t`every hour`);
    } else if (isDefined(hoursDescription) && hoursDescription !== '') {
      // Use hours description for specific hours or hour patterns
      descriptions.push(hoursDescription);
    } else if (isDefined(minutesDescription) && minutesDescription !== '') {
      // Fallback to minutes description
      descriptions.push(minutesDescription);
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
