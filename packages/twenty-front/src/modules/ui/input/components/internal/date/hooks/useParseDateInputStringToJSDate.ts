import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { isValid, parse } from 'date-fns';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParseDateInputStringToJSDate = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseDateInputStringToJSDate = (dateAsString: string) => {
    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const parsedDate = parse(dateAsString, parsingFormat, new Date());

    if (!isValid(parsedDate)) {
      return null;
    }

    return parsedDate;
  };

  return {
    parseDateInputStringToJSDate,
  };
};
