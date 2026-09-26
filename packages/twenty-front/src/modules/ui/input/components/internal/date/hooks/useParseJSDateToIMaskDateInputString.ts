import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { localizeDateFormatToCalendarSystem } from '@/localization/utils/localizeDateFormatToCalendarSystem';

import { format } from 'date-fns';
import { turnJSDateToPlainDate } from 'twenty-shared/utils';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParseJSDateToIMaskDateInputString = () => {
  const { dateFormat, calendarSystem } = useDateTimeFormat();

  const parseIMaskJSDateIMaskDateInputString = (jsDate: Date) => {
    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const formattedDate = format(
      jsDate,
      localizeDateFormatToCalendarSystem({
        dateFormat: parsingFormat,
        plainDate: turnJSDateToPlainDate(jsDate),
        calendarSystem,
      }),
    );

    return formattedDate;
  };

  return {
    parseIMaskJSDateIMaskDateInputString,
  };
};
