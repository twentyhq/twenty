import { format, type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Temporal } from 'temporal-polyfill';
import { isDateWithoutTime } from 'twenty-shared/utils';

export const formatDateISOStringToCustomUnicodeFormat = ({
  date,
  timeZone,
  dateFormat,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: string;
  localeCatalog: Locale;
}) => {
  try {
    // Same date-only short-circuit as formatDateISOStringToDate: render the
    // calendar date without timezone interpretation to prevent day shifts.
    if (isDateWithoutTime(date)) {
      const plainDate = Temporal.PlainDate.from(date);
      return format(
        new Date(plainDate.year, plainDate.month - 1, plainDate.day),
        dateFormat,
        { locale: localeCatalog },
      );
    }

    return formatInTimeZone(new Date(date), timeZone, dateFormat, {
      locale: localeCatalog,
    });
  } catch {
    return 'Invalid format string';
  }
};
