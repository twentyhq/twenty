import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

import { format, isValid } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParseJSDateToIMaskDateInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseIMaskJSDateIMaskDateInputString = (jsDate: Date) => {
    if (!isDefined(jsDate) || !isValid(jsDate)) {
      return '';
    }

    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const formattedDate = format(jsDate, parsingFormat);

    return formattedDate;
  };

  return {
    parseIMaskJSDateIMaskDateInputString,
  };
};
