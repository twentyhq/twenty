import { formatPlainDateISOString } from '@/localization/utils/formatPlainDateISOString';
import { type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
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
    if (isDateWithoutTime(date)) {
      return formatPlainDateISOString({ date, dateFormat, localeCatalog });
    }

    return formatInTimeZone(new Date(date), timeZone, dateFormat, {
      locale: localeCatalog,
    });
  } catch {
    return 'Invalid format string';
  }
};
