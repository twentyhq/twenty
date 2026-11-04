import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { CalendarStartDay } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  convertFirstDayOfTheWeekToCalendarStartDayNumber,
  isDefined,
} from 'twenty-shared/utils';

import { DatePickerException } from '@/ui/input/components/internal/date/exceptions/DatePickerException';
import { type DatePickerProps } from 'twenty-ui/components/input';

const CALENDAR_WEEK_START_DAYS: readonly DatePickerProps['weekStart'][] = [
  0, 1, 2, 3, 4, 5, 6,
];

export const getDatePickerWeekStartOrThrow = (
  calendarStartDay?: number | null,
): DatePickerProps['weekStart'] => {
  if (!isDefined(calendarStartDay)) {
    return CalendarStartDay.SUNDAY;
  }

  if (calendarStartDay === CalendarStartDay.SYSTEM) {
    return convertFirstDayOfTheWeekToCalendarStartDayNumber(
      detectCalendarStartDay(),
    );
  }

  const weekStart = CALENDAR_WEEK_START_DAYS.find(
    (day) => day === calendarStartDay,
  );

  if (isDefined(weekStart)) {
    return weekStart;
  }

  throw new DatePickerException({
    message: doNotTranslate(
      'Calendar week starts must be weekdays 0 through 6 or the system preference.',
    ),
  });
};
