import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { detectNumberFormat } from '@/localization/utils/detection/detectNumberFormat';
import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { CalendarStartDay } from 'twenty-shared/constants';

export type WorkspaceMemberFormatPreferences = {
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  calendarStartDay: CalendarStartDay;
};

export const workspaceMemberFormatPreferencesState =
  createStateV2<WorkspaceMemberFormatPreferences>({
    key: 'workspaceMemberFormatPreferencesState',
    defaultValue: {
      timeZone: detectTimeZone(),
      dateFormat: DateFormat[detectDateFormat()],
      timeFormat: TimeFormat[detectTimeFormat()],
      numberFormat: NumberFormat[detectNumberFormat()],
      calendarStartDay: CalendarStartDay[detectCalendarStartDay()],
    },
  });
