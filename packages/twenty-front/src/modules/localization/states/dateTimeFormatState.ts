import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { createState } from 'twenty-ui/utilities';

export const dateTimeFormatState = createState<{
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}>({
  key: 'dateTimeFormatState',
  defaultValue: {
    timeZone: detectTimeZone(),
    dateFormat: DateFormat.MONTH_FIRST,
    timeFormat: TimeFormat['HOUR_24'],
  },
});
