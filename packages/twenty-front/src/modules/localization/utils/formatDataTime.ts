import { formatInTimeZone } from 'date-fns-tz';
import { parseDate } from '~/utils/date-utils';

export const formatDatetime = (
  date: Date | string,
  timeZone: string,
  dateFormat: string,
  timeFormat: string,
) => {
  return formatInTimeZone(
    parseDate(date).toJSDate(),
    timeZone,
    `${dateFormat} ${timeFormat}`,
  );
};
