import { DateFormat } from '@/localization/constants/DateFormat';
import { DateTime } from 'luxon';
import { getDateFormatString } from '~/utils/date-utils';

type ParseDateToStringArgs = {
  date: Date;
  isDateTimeInput: boolean;
  userTimezone: string | undefined;
  dateFormat?: DateFormat;
};

export const parseDateToString = ({
  date,
  isDateTimeInput,
  userTimezone,
  dateFormat = DateFormat.MONTH_FIRST,
}: ParseDateToStringArgs) => {
  const parsingFormat = getDateFormatString(dateFormat, isDateTimeInput);

  const dateParsed = DateTime.fromJSDate(date, { zone: userTimezone });

  const dateWithoutTime = DateTime.fromJSDate(date)
    .toLocal()
    .set({
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

  const formattedDate = isDateTimeInput
    ? dateParsed.setZone(userTimezone).toFormat(parsingFormat)
    : dateWithoutTime.toFormat(parsingFormat);

  return formattedDate;
};
