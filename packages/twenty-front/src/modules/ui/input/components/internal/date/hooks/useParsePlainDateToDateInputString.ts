import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { localizeDateFormatToCalendarSystem } from '@/localization/utils/localizeDateFormatToCalendarSystem';

import { format } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const useParsePlainDateToDateInputString = () => {
  const { dateFormat, calendarSystem } = useDateTimeFormat();

  const parsePlainDateToDateInputString = (plainDateString: string) => {
    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const plainDate = Temporal.PlainDate.from(plainDateString);

    return format(
      new Date(plainDate.year, plainDate.month - 1, plainDate.day),
      localizeDateFormatToCalendarSystem({
        dateFormat: parsingFormat,
        plainDate,
        calendarSystem,
      }),
    );
  };

  return {
    parsePlainDateToDateInputString,
  };
};
