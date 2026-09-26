import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { localizeDateFormatToCalendarSystem } from '@/localization/utils/localizeDateFormatToCalendarSystem';
import { format, isValid } from 'date-fns';
import { isDefined, turnJSDateToPlainDate } from 'twenty-shared/utils';
import { getDateTimeFormatStringFoDatePickerInputMask } from '~/utils/date-utils';

export const useParseJSDateToIMaskDateTimeInputString = () => {
  const { dateFormat, timeFormat, calendarSystem } = useDateTimeFormat();

  const parseJSDateToDateTimeInputString = (date: Date) => {
    if (!isDefined(date) || !isValid(date)) {
      return '';
    }

    const parsingFormat = getDateTimeFormatStringFoDatePickerInputMask({
      dateFormat,
      timeFormat,
    });

    return format(
      date,
      localizeDateFormatToCalendarSystem({
        dateFormat: parsingFormat,
        plainDate: turnJSDateToPlainDate(date),
        calendarSystem,
      }),
    );
  };

  return {
    parseJSDateToDateTimeInputString,
  };
};
