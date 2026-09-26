import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { convertCalendarDateInputToGregorian } from '@/localization/utils/convertCalendarDateInputToGregorian';
import { isValid, parse } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';
import { getDateTimeFormatStringFoDatePickerInputMask } from '~/utils/date-utils';

export const useParseDateTimeInputStringToJSDate = () => {
  const { dateFormat, timeFormat, calendarSystem } = useDateTimeFormat();

  const parseDateTimeInputStringToJSDate = (dateAsString: string) => {
    const parsingFormat = getDateTimeFormatStringFoDatePickerInputMask({
      dateFormat,
      timeFormat,
    });
    const referenceDate = new Date();

    const gregorianDateAsString = convertCalendarDateInputToGregorian({
      dateInput: dateAsString,
      dateInputFormat: parsingFormat,
      calendarSystem,
    });

    if (!isDefined(gregorianDateAsString)) {
      return null;
    }

    const parsedDate = parse(
      gregorianDateAsString,
      parsingFormat,
      referenceDate,
    );

    if (!isValid(parsedDate)) {
      return null;
    }

    return parsedDate;
  };

  return {
    parseDateTimeInputStringToJSDate,
  };
};
