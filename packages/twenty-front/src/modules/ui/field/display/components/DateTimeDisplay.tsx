import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { useRecoilValue } from 'recoil';

import { dateTimeFormatState } from '@/workspace-member/states/dateTimeFormatState';
import { parseDate } from '~/utils/date-utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
};

export const DateTimeDisplay = ({ value }: DateTimeDisplayProps) => {
  const dateTimeFormat = useRecoilValue(dateTimeFormatState);

  const formatDatetime = (date: Date | string) => {
    return formatInTimeZone(
      parseDate(date).toJSDate(),
      dateTimeFormat.timeZone,
      `${dateTimeFormat.dateFormat} ${dateTimeFormat.timeFormat}`,
    );
  };
  return <EllipsisDisplay>{value && formatDatetime(value)}</EllipsisDisplay>;
};
