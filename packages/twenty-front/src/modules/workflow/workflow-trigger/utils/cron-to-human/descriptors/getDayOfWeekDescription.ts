import { t } from '@lingui/core/macro';
import { format, type Locale } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { isListValue } from '~/utils/validation/isListValue';
import { isNumericRange } from '~/utils/validation/isNumericRange';
import { isStepValue } from '~/utils/validation/isStepValue';
import { type CronDescriptionOptions } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

const getDayName = (
  dayNum: number,
  dayOfWeekStartIndexZero: boolean,
  localeCatalog?: Locale,
): string => {
  // Handle both 0 and 7 as Sunday
  const normalizedDay = dayNum === 7 ? 0 : dayNum;

  // Create a date for the given day (using a Sunday as base: 2024-01-07)
  const baseDate = new Date(2024, 0, 7); // Sunday
  const dayDate = new Date(
    baseDate.getTime() + normalizedDay * 24 * 60 * 60 * 1000,
  );

  if (isDefined(localeCatalog)) {
    return format(dayDate, 'EEEE', { locale: localeCatalog });
  }

  return format(dayDate, 'EEEE');
};

export const getDayOfWeekDescription = (
  dayOfWeek: string,
  options: CronDescriptionOptions,
  localeCatalog?: Locale,
): string => {
  if (!isDefined(dayOfWeek) || dayOfWeek.trim() === '') {
    return '';
  }

  // Every day of week
  if (dayOfWeek === '*') {
    return '';
  }

  const dayOfWeekStartIndexZero = options.dayOfWeekStartIndexZero ?? true;

  // Last occurrence of a weekday in the month (e.g., "5L" = last Friday)
  if (dayOfWeek.includes('L')) {
    const day = dayOfWeek.replace('L', '');
    const dayNum = parseInt(day, 10);
    if (!isNaN(dayNum)) {
      const dayName = getDayName(
        dayNum,
        dayOfWeekStartIndexZero,
        localeCatalog,
      );
      return t`on the last ${dayName} of the month`;
    }
  }

  // Nth occurrence of a weekday (e.g., "1#2" = second Monday)
  if (dayOfWeek.includes('#')) {
    const [day, occurrence] = dayOfWeek.split('#');
    const dayNum = parseInt(day, 10);
    const occurrenceNum = parseInt(occurrence, 10);

    if (!isNaN(dayNum) && !isNaN(occurrenceNum)) {
      const dayName = getDayName(
        dayNum,
        dayOfWeekStartIndexZero,
        localeCatalog,
      );
      const getOrdinals = () => [
        t`first`,
        t`second`,
        t`third`,
        t`fourth`,
        t`fifth`,
      ];
      const ordinals = getOrdinals();
      const ordinal = ordinals[occurrenceNum - 1] || occurrenceNum.toString();
      return t`on the ${ordinal} ${dayName} of the month`;
    }
  }

  // Step values (e.g., "*/2" = every other day)
  if (isStepValue(dayOfWeek)) {
    const [range, step] = dayOfWeek.split('/');
    const stepNum = parseInt(step, 10);

    if (range === '*') {
      if (stepNum === 1) {
        return t`every day`;
      }
      const stepNumStr = stepNum.toString();
      return t`every ${stepNumStr} days`;
    }

    return t`every ${stepNum} days`;
  }

  // Range values (e.g., "1-5" = Monday to Friday)
  if (isNumericRange(dayOfWeek) && dayOfWeek.includes('-')) {
    const [start, end] = dayOfWeek.split('-');
    const startDay = getDayName(
      parseInt(start, 10),
      dayOfWeekStartIndexZero,
      localeCatalog,
    );
    const endDay = getDayName(
      parseInt(end, 10),
      dayOfWeekStartIndexZero,
      localeCatalog,
    );

    // Special case for weekdays
    if (start === '1' && end === '5' && dayOfWeekStartIndexZero) {
      return t`on weekdays`;
    }
    if (start === '2' && end === '6' && !dayOfWeekStartIndexZero) {
      return t`on weekdays`;
    }

    return t`from ${startDay} to ${endDay}`;
  }

  // List values (e.g., "1,3,5")
  if (isListValue(dayOfWeek)) {
    const values = dayOfWeek.split(',').map((v) => v.trim());
    const dayNames = values.map((day) => {
      const dayNum = parseInt(day, 10);
      return !isNaN(dayNum)
        ? getDayName(dayNum, dayOfWeekStartIndexZero, localeCatalog)
        : day;
    });

    if (dayNames.length === 1) {
      const dayName = dayNames[0];
      return t`only on ${dayName}`;
    }
    if (dayNames.length === 2) {
      const firstDay = dayNames[0];
      const secondDay = dayNames[1];
      return t`only on ${firstDay} and ${secondDay}`;
    }
    const lastDay = dayNames.pop();
    const remainingDays = dayNames.join(', ');
    return t`only on ${remainingDays} and ${lastDay}`;
  }

  // Single day value
  const dayNum = parseInt(dayOfWeek, 10);
  if (!isNaN(dayNum)) {
    const dayName = getDayName(dayNum, dayOfWeekStartIndexZero, localeCatalog);
    return t`only on ${dayName}`;
  }

  return dayOfWeek;
};
