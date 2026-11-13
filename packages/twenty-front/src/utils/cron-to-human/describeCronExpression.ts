import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Locale } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { getDaysDescription } from './descriptors/getDaysDescription';
import { getHoursDescription } from './descriptors/getHoursDescription';
import { getMinutesDescription } from './descriptors/getMinutesDescription';
import { getMonthsDescription } from './descriptors/getMonthsDescription';
import { formatTime as formatCronTime } from '~/utils/format/formatTime';
import { isListValue } from '~/utils/validation/isListValue';
import { isNumericRange } from '~/utils/validation/isNumericRange';
import {
  type CronDescriptionOptions,
  DEFAULT_CRON_DESCRIPTION_OPTIONS,
} from './types/CronDescriptionOptions';
import { parseCronExpression } from './utils/parseCronExpression';

// A fixed hour combined with a step, range, list or wildcard minute field
// cannot be formatted as a single time; the minutes pattern has to be
// composed with the hour window instead.
const isMinutePattern = (minutes: string) =>
  minutes === '*' ||
  minutes.includes('/') ||
  minutes.includes('-') ||
  minutes.includes(',');

const isHourPattern = (hours: string) =>
  hours === '*' || hours.includes('/') || hours.includes('-');

export const describeCronExpression = (
  expression: string,
  options: CronDescriptionOptions = DEFAULT_CRON_DESCRIPTION_OPTIONS,
  localeCatalog?: Locale,
): string => {
  if (!isDefined(expression) || expression.trim() === '') {
    throw new Error(t`Cron expression is required`);
  }

  try {
    const parts = parseCronExpression(expression);
    const mergedOptions = { ...DEFAULT_CRON_DESCRIPTION_OPTIONS, ...options };
    const use24Hour = mergedOptions.use24HourTimeFormat ?? true;

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

    if (isMinutePattern(parts.minutes) && !isHourPattern(parts.hours)) {
      // e.g. "*/5 9 * * *" or "* 9,17 * * 1-5": describe the minute pattern
      // inside the hour window instead of formatting the hour as a time
      if (isNumericRange(parts.minutes)) {
        const [startMinute, endMinute] = parts.minutes.split('-');
        const startTime = formatCronTime({
          hour: parts.hours,
          minute: startMinute,
          use24HourFormat: use24Hour,
        });
        const endTime = formatCronTime({
          hour: parts.hours,
          minute: endMinute,
          use24HourFormat: use24Hour,
          appendUTC: true,
        });
        descriptions.push(t`every minute from ${startTime} to ${endTime}`);
      } else if (isListValue(parts.hours)) {
        const hoursList = parts.hours.split(',').map((hour) => hour.trim());
        const formattedHours = hoursList.map((hour) =>
          formatCronTime({
            hour,
            minute: '0',
            use24HourFormat: use24Hour,
          }),
        );
        const lastHour = formattedHours.pop() ?? '';
        const remainingHours = formattedHours.join(', ');
        descriptions.push(
          t`${minutesDescription} during ${remainingHours} and ${lastHour} UTC`,
        );
      } else {
        const startTime = formatCronTime({
          hour: parts.hours,
          minute: '0',
          use24HourFormat: use24Hour,
        });
        const endTime = formatCronTime({
          hour: parts.hours,
          minute: '59',
          use24HourFormat: use24Hour,
          appendUTC: true,
        });
        descriptions.push(
          t`${minutesDescription} between ${startTime} and ${endTime}`,
        );
      }
    } else if (parts.minutes.includes('/') && parts.hours.includes('-')) {
      // Special case: minute intervals with hour ranges (e.g., "*/15 9-17")
      if (isDefined(minutesDescription) && minutesDescription !== '') {
        descriptions.push(minutesDescription);
      }
      if (isDefined(hoursDescription) && hoursDescription !== '') {
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
      descriptions.push(hoursDescription);
    } else if (isDefined(minutesDescription) && minutesDescription !== '') {
      descriptions.push(minutesDescription);
    }
    const daysDescription = getDaysDescription({
      dayOfMonth: parts.dayOfMonth,
      dayOfWeek: parts.dayOfWeek,
      options: mergedOptions,
      localeCatalog,
    });

    if (isNonEmptyString(daysDescription)) {
      descriptions.push(daysDescription);
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
    return descriptions.join(' ');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : t`Unknown error`;
    throw new Error(t`Failed to describe cron expression: ${errorMessage}`);
  }
};
