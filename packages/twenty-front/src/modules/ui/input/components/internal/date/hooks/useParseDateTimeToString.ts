import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { UserContext } from '@/users/contexts/UserContext';
import { formatInTimeZone } from 'date-fns-tz';
import { useContext } from 'react';
import { getDateTimeFormatString } from '~/utils/date-utils';

export const useParseDateTimeToString = () => {
  const { dateFormat } = useDateTimeFormat();
  const { timeZone } = useContext(UserContext);

  const parseDateTimeToString = (date: Date) => {
    const parsingFormat = getDateTimeFormatString(dateFormat);

    return formatInTimeZone(date, timeZone, parsingFormat);
  };

  return {
    parseDateTimeToString,
  };
};
