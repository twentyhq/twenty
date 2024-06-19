import formatInTimeZone from 'date-fns-tz/formatInTimeZone';

import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { parseDate } from '~/utils/date-utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
};

export const DateTimeDisplay = ({
  value,
  timeZone,
  dateFormat,
  timeFormat,
}: DateTimeDisplayProps) => {
  const formatDatetime = (date: Date | string) => {
    return formatInTimeZone(
      parseDate(date).toJSDate(),
      timeZone,
      `${dateFormat} ${timeFormat}`,
    );
  };
  return <EllipsisDisplay>{value && formatDatetime(value)}</EllipsisDisplay>;
};
