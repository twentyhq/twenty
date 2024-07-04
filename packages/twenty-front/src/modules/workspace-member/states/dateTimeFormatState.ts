import { createState } from 'twenty-ui';

import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';

export const dateTimeFormatState = createState<{
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}>({
  key: 'dateTimeFormatState',
  defaultValue: {
    timeZone: detectTimeZone(),
    dateFormat: DateFormat.MONTH_FIRST,
    timeFormat: TimeFormat.HOUR_24,
  },
});
