/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { type CalendarPeriodUnit } from 'src/engine/core-modules/usage-limit/types/calendar-period-unit.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { getCalendarDayPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-day-period.util';
import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-month-period.util';
import { getCalendarWeekPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-week-period.util';

@Injectable()
export class UsagePeriodService {
  getCurrentPeriod(periodUnit: CalendarPeriodUnit): UsagePeriod {
    const now = new Date();

    switch (periodUnit) {
      case 'day':
        return getCalendarDayPeriod(now);
      case 'week':
        return getCalendarWeekPeriod(now);
      case 'month':
        return getCalendarMonthPeriod(now);
      default:
        return assertUnreachable(
          periodUnit,
          `Unknown period unit ${periodUnit}`,
        );
    }
  }
}
