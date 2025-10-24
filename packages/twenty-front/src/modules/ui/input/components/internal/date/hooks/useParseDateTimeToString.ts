import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { UserContext } from '@/users/contexts/UserContext';
import { format } from 'date-fns';
import { useContext } from 'react';
import { getDateTimeFormatString } from '~/utils/date-utils';

export const useParseDateTimeToString = () => {
  const { dateFormat } = useDateTimeFormat();
  const { timeZone } = useContext(UserContext);

  const parseDateTimeToString = (date: Date) => {
    const parsingFormat = getDateTimeFormatString(dateFormat);

    console.log({
      parsingFormat,
      date,
      formatted: format(date, parsingFormat),
    });
    return format(date, parsingFormat);
  };

  return {
    parseDateTimeToString,
  };
};
