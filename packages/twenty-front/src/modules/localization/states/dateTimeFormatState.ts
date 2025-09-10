import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { createState } from 'twenty-ui/utilities';

export const dateTimeFormatState = createState<{
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
}>({
  key: 'dateTimeFormatState',
  defaultValue: {
    timeZone: detectTimeZone(),
    dateFormat: DateFormat.MONTH_FIRST,
    timeFormat: TimeFormat['HOUR_24'],
    numberFormat: NumberFormat.COMMAS_AND_DOT,
  },
});
