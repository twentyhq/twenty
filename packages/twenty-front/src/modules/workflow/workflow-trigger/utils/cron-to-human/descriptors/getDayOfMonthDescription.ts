import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type CronDescriptionOptions } from '../types/cronDescriptionOptions';
import {
  isListValue,
  isNumericRange,
  isStepValue,
} from '../utils/cronStringUtilities';

export const getDayOfMonthDescription = (
  dayOfMonth: string,
  _options: CronDescriptionOptions,
): string => {
  if (!isDefined(dayOfMonth) || dayOfMonth.trim() === '') {
    return '';
  }

  // Every day
  if (dayOfMonth === '*') {
    return t`every day`;
  }

  // Last day of month
  if (dayOfMonth === 'L') {
    return t`on the last day of the month`;
  }

  // Weekday (W) - closest weekday to the given date
  if (dayOfMonth.includes('W')) {
    const day = dayOfMonth.replace('W', '');
    const dayNum = parseInt(day, 10);
    if (!isNaN(dayNum)) {
      const dayNumStr = dayNum.toString();
      return t`on the weekday closest to day ${dayNumStr} of the month`;
    }
    return t`on weekdays only`;
  }

  // Step values (e.g., "*/5" = every 5 days)
  if (isStepValue(dayOfMonth)) {
    const [range, step] = dayOfMonth.split('/');
    const stepNum = parseInt(step, 10);

    if (range === '*') {
      if (stepNum === 1) {
        return t`every day`;
      }
      const stepNumStr = stepNum.toString();
      return t`every ${stepNumStr} days`;
    }

    // Range with step (e.g., "1-15/3")
    if (range.includes('-')) {
      const [start, end] = range.split('-');
      const stepNumStr = stepNum.toString();
      const startDay = start;
      const endDay = end;
      return t`every ${stepNumStr} days, between day ${startDay} and ${endDay} of the month`;
    }

    const stepNumStr = stepNum.toString();
    return t`every ${stepNumStr} days`;
  }

  // Range values (e.g., "1-15")
  if (isNumericRange(dayOfMonth) && dayOfMonth.includes('-')) {
    const [start, end] = dayOfMonth.split('-');
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    const startDay = startNum.toString();
    const endDay = endNum.toString();
    return t`between day ${startDay} and ${endDay} of the month`;
  }

  // List values (e.g., "1,15,30")
  if (isListValue(dayOfMonth)) {
    const values = dayOfMonth.split(',').map((v) => v.trim());
    if (values.length === 2) {
      const firstDay = values[0];
      const secondDay = values[1];
      return t`on day ${firstDay} and ${secondDay} of the month`;
    }
    const lastDay = values.pop();
    const remainingDays = values.join(', ');
    return t`on day ${remainingDays} and ${lastDay} of the month`;
  }

  // Single day value
  const dayNum = parseInt(dayOfMonth, 10);
  if (!isNaN(dayNum)) {
    const dayNumStr = dayNum.toString();
    return t`on day ${dayNumStr} of the month`;
  }

  return dayOfMonth;
};
