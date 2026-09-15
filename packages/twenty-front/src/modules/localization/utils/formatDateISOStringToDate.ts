import { type DateFormat } from '@/localization/constants/DateFormat';
import { formatPlainDateISOString } from '@/localization/utils/formatPlainDateISOString';
import { type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
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
  if (isDateWithoutTime(date)) {
    return formatPlainDateISOString({ date, dateFormat, localeCatalog });
  }

  return formatInTimeZone(new Date(date), timeZone, dateFormat, {
    locale: localeCatalog,
  });
};
