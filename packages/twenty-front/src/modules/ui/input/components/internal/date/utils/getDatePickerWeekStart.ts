import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { CalendarStartDay } from 'twenty-shared/constants';
import { convertFirstDayOfTheWeekToCalendarStartDayNumber } from 'twenty-shared/utils';
import { type DatePickerProps } from 'twenty-ui/components/input';

const CALENDAR_WEEK_START_DAYS: readonly DatePickerProps['weekStart'][] = [
  0, 1, 2, 3, 4, 5, 6,
];

export const getDatePickerWeekStart = (
  calendarStartDay?: number | null,
): DatePickerProps['weekStart'] => {
  if (calendarStartDay === CalendarStartDay.SYSTEM) {
    return convertFirstDayOfTheWeekToCalendarStartDayNumber(
      detectCalendarStartDay(),
    );
  }

  return (
    CALENDAR_WEEK_START_DAYS.find((day) => day === calendarStartDay) ??
    CalendarStartDay.SUNDAY
  );
};
