import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { format, isValid } from 'date-fns';
import { getDateTimeFormatStringFoDatePickerInputMask } from '~/utils/date-utils';

export const useParseJSDateToIMaskDateTimeInputString = () => {
  const { dateFormat, timeFormat } = useDateTimeFormat();

  const parseJSDateToDateTimeInputString = (date: Date) => {
    if (!date || !isValid(date)) {
      return '';
    }

    const parsingFormat = getDateTimeFormatStringFoDatePickerInputMask({
      dateFormat,
      timeFormat,
    });

    return format(date, parsingFormat);
  };

  return {
    parseJSDateToDateTimeInputString,
  };
};
