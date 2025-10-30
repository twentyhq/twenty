import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { isValid, parse } from 'date-fns';
import { getDateTimeFormatStringFoDatePickerInputMask } from '~/utils/date-utils';

export const useParseDateTimeInputStringToJSDate = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseDateTimeInputStringToJSDate = (dateAsString: string) => {
    const parsingFormat =
      getDateTimeFormatStringFoDatePickerInputMask(dateFormat);
    const referenceDate = new Date();

    const parsedDate = parse(dateAsString, parsingFormat, referenceDate);

    if (!isValid(parsedDate)) {
      return null;
    }

    return parsedDate;
  };

  return {
    parseDateTimeInputStringToJSDate,
  };
};
