import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { format } from 'date-fns';
import { getDateTimeFormatString } from '~/utils/date-utils';

export const useParseJSDateToDateTimeInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseJSDateToDateTimeInputString = (date: Date) => {
    const parsingFormat = getDateTimeFormatString(dateFormat);

    return format(date, parsingFormat);
  };

  return {
    parseJSDateToDateTimeInputString,
  };
};
