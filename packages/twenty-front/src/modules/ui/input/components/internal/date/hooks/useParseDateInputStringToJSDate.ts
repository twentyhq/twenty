import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { convertCalendarDateInputToGregorian } from '@/localization/utils/convertCalendarDateInputToGregorian';
import { isValid, parse } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParseDateInputStringToJSDate = () => {
  const { dateFormat, calendarSystem } = useDateTimeFormat();

  const parseDateInputStringToJSDate = (dateAsString: string) => {
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

    return parsedDate;
  };

  return {
    parseDateInputStringToJSDate,
  };
};
