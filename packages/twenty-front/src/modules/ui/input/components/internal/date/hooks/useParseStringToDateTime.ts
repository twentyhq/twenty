import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { UserContext } from '@/users/contexts/UserContext';
import { isValid, parse } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useContext } from 'react';
import { getDateTimeFormatString } from '~/utils/date-utils';

export const useParseStringToDateTime = () => {
  const { dateFormat } = useDateTimeFormat();
  const { timeZone } = useContext(UserContext);

  const parseStringToDateTime = (dateAsString: string) => {
    const parsingFormat = getDateTimeFormatString(dateFormat);
    const referenceDate = new Date();

    const parsedDate = parse(dateAsString, parsingFormat, referenceDate);

    if (!isValid(parsedDate)) {
      return null;
    }

    return zonedTimeToUtc(parsedDate, timeZone);
  };

  return {
    parseStringToDateTime,
  };
};
