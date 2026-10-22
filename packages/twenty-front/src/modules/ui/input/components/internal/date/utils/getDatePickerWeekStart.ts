import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { CalendarStartDay } from 'twenty-shared/constants';
import {
  convertFirstDayOfTheWeekToCalendarStartDayNumber,
  isDefined,
} from 'twenty-shared/utils';
import { type DateCalendarProps } from 'twenty-ui/components/input';

export const getDatePickerWeekStart = (
  calendarStartDay?: CalendarStartDay,
): DateCalendarProps['weekStart'] => {
  if (!isDefined(calendarStartDay)) {
    return CalendarStartDay.SUNDAY;
  }

  if (calendarStartDay === CalendarStartDay.SYSTEM) {
    return convertFirstDayOfTheWeekToCalendarStartDayNumber(
      detectCalendarStartDay(),
    );
  }

  return calendarStartDay;
};
