import { type DateFormat } from '@/localization/constants/DateFormat';
import { format, type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Temporal } from 'temporal-polyfill';
import { isDateWithoutTime } from 'twenty-shared/utils';

export const formatDateISOStringToDate = ({
  date,
  timeZone,
  dateFormat,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: DateFormat;
  localeCatalog?: Locale;
}) => {
  // Date-only inputs are calendar dates with no timezone semantics. Render them
  // directly from a local-constructor Date so date-fns's `format` reads back the
  // same calendar day in any machine timezone (formatInTimeZone would otherwise
  // shift "2022-01-01" to "2021-12-31" for negative-offset timezones).
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
};
