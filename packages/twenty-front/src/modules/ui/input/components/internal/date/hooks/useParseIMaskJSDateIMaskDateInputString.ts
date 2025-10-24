import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

import { format } from 'date-fns';
import { getDateFormatString } from '~/utils/date-utils';

export const useParseIMaskJSDateIMaskDateInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseIMaskJSDateIMaskDateInputString = (jsDate: Date) => {
    const parsingFormat = getDateFormatString(dateFormat);

    console.log({
      parsingFormat,
      jsDate,
    });

    const formattedDate = format(jsDate, parsingFormat);

    console.log({
      parsingFormat,
      jsDate,
      formattedDate,
    });

    return formattedDate;
  };

  return {
    parseIMaskJSDateIMaskDateInputString,
  };
};
