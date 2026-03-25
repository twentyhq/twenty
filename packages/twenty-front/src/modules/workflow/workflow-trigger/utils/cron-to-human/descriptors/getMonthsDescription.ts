import { t } from '@lingui/core/macro';
import { format, type Locale } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { isListValue } from '~/utils/validation/isListValue';
import { isNumericRange } from '~/utils/validation/isNumericRange';
import { isStepValue } from '~/utils/validation/isStepValue';
import { type CronDescriptionOptions } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

const getMonthName = (
  monthNum: number,
  monthStartIndexZero: boolean,
  localeCatalog?: Locale,
): string => {
  const index = monthStartIndexZero ? monthNum : monthNum - 1;

  // Create a date for the given month (using January 1st as base)
  const monthDate = new Date(2024, index, 1);

  if (isDefined(localeCatalog)) {
    return format(monthDate, 'MMMM', { locale: localeCatalog });
  }

  return format(monthDate, 'MMMM');
};

export const getMonthsDescription = (
  months: string,
  options: CronDescriptionOptions,
  localeCatalog?: Locale,
): string => {
  if (!isDefined(months) || months.trim() === '') {
    return '';
  }

  // Every month
  if (months === '*') {
    return '';
  }

  const monthStartIndexZero = options.monthStartIndexZero ?? false;

  // Step values (e.g., "*/3" = every 3 months)
  if (isStepValue(months)) {
    const [range, step] = months.split('/');
    const stepNum = parseInt(step, 10);
    const stepNumStr = stepNum.toString();

    if (range === '*') {
      if (stepNum === 1) {
        return '';
      }
      return t`every ${stepNumStr} months`;
    }

    // Range with step (e.g., "1-6/2")
    if (range.includes('-')) {
      const [start, end] = range.split('-');
      const startMonth = getMonthName(
        parseInt(start, 10),
        monthStartIndexZero,
        localeCatalog,
      );
      const endMonth = getMonthName(
        parseInt(end, 10),
        monthStartIndexZero,
        localeCatalog,
      );
      return t`every ${stepNumStr} months, between ${startMonth} and ${endMonth}`;
    }

    return t`every ${stepNumStr} months`;
  }

  // Range values (e.g., "1-6")
  if (isNumericRange(months) && months.includes('-')) {
    const [start, end] = months.split('-');
    const startMonth = getMonthName(
      parseInt(start, 10),
      monthStartIndexZero,
      localeCatalog,
    );
    const endMonth = getMonthName(
      parseInt(end, 10),
      monthStartIndexZero,
      localeCatalog,
    );
    return t`between ${startMonth} and ${endMonth}`;
  }

  // List values (e.g., "1,6,12")
  if (isListValue(months)) {
    const values = months.split(',').map((v) => v.trim());
    const monthNames = values.map((month) => {
      const monthNum = parseInt(month, 10);
      return !isNaN(monthNum)
        ? getMonthName(monthNum, monthStartIndexZero, localeCatalog)
        : month;
    });

    if (monthNames.length === 1) {
      const monthName = monthNames[0];
      return t`only in ${monthName}`;
    }
    if (monthNames.length === 2) {
      const firstMonth = monthNames[0];
      const secondMonth = monthNames[1];
      return t`only in ${firstMonth} and ${secondMonth}`;
    }
    const lastMonth = monthNames.pop();
    const remainingMonths = monthNames.join(', ');
    return t`only in ${remainingMonths} and ${lastMonth}`;
  }

  // Single month value
  const monthNum = parseInt(months, 10);
  if (!isNaN(monthNum)) {
    const monthName = getMonthName(
      monthNum,
      monthStartIndexZero,
      localeCatalog,
    );
    return t`only in ${monthName}`;
  }

  return months;
};
