import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { convertCalendarDateInputToGregorian } from '@/localization/utils/convertCalendarDateInputToGregorian';
import { format, isValid, parse } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParseDateInputStringToPlainDate = () => {
  const { dateFormat, calendarSystem } = useDateTimeFormat();

  const parseDateInputStringToPlainDate = (dateAsString: string) => {
    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const gregorianDateAsString = convertCalendarDateInputToGregorian({
      dateInput: dateAsString,
      dateInputFormat: parsingFormat,
      calendarSystem,
    });

    if (!isDefined(gregorianDateAsString)) {
      return null;
    }

    const parsedDate = parse(gregorianDateAsString, parsingFormat, new Date());

    if (!isValid(parsedDate)) {
      return null;
    }

    const formattedDate = format(parsedDate, DATE_TYPE_FORMAT);

    return formattedDate;
  };

  return {
    parseDateInputStringToPlainDate,
  };
};
