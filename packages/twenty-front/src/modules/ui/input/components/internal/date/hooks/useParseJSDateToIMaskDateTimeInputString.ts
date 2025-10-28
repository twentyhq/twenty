import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { format } from 'date-fns';
import { getDateTimeFormatStringFoDatePickerInputMask } from '~/utils/date-utils';

export const useParseJSDateToIMaskDateTimeInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseJSDateToDateTimeInputString = (date: Date) => {
    const parsingFormat =
      getDateTimeFormatStringFoDatePickerInputMask(dateFormat);

    return format(date, parsingFormat);
  };

  return {
    parseJSDateToDateTimeInputString,
  };
};
