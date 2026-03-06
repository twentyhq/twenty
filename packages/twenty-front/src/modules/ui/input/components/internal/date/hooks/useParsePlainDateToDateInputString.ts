import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

import { format, isValid, parse } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParsePlainDateToDateInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parsePlainDateToDateInputString = (plainDate: string) => {
    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const parsedDate = parse(plainDate, DATE_TYPE_FORMAT, new Date());

    if (!isValid(parsedDate)) {
      return '';
    }

    const formattedDate = format(parsedDate, parsingFormat);

    return formattedDate;
  };

  return {
    parsePlainDateToDateInputString,
  };
};
