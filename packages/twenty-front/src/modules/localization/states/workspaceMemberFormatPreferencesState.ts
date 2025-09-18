import { CalendarStartDay } from '@/localization/constants/CalendarStartDay';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectCalendarStartDay } from '@/localization/utils/detectCalendarStartDay';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { createState } from 'twenty-ui/utilities';

export type WorkspaceMemberFormatPreferences = {
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  calendarStartDay: CalendarStartDay;
};

const getDefaultFormatPreferences = (): WorkspaceMemberFormatPreferences => {
  try {
    return {
      timeZone: detectTimeZone(),
      dateFormat: DateFormat[detectDateFormat()],
      timeFormat: TimeFormat[detectTimeFormat()],
      numberFormat: NumberFormat[detectNumberFormat()],
      calendarStartDay: CalendarStartDay[detectCalendarStartDay()],
    };
  } catch {
    // Fallback for testing environments where detection might fail
    return {
      timeZone: 'UTC',
      dateFormat: DateFormat.MONTH_FIRST,
      timeFormat: TimeFormat.HOUR_24,
      numberFormat: NumberFormat.COMMAS_AND_DOT,
      calendarStartDay: CalendarStartDay.MONDAY,
    };
  }
};

export const workspaceMemberFormatPreferencesState =
  createState<WorkspaceMemberFormatPreferences>({
    key: 'workspaceMemberFormatPreferencesState',
    defaultValue: getDefaultFormatPreferences(),
  });
