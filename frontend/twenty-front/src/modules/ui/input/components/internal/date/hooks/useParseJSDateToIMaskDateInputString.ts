import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

import { format } from 'date-fns';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParseJSDateToIMaskDateInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseIMaskJSDateIMaskDateInputString = (jsDate: Date) => {
    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const formattedDate = format(jsDate, parsingFormat);

    return formattedDate;
  };

  return {
    parseIMaskJSDateIMaskDateInputString,
  };
};
