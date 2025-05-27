import { DateFormat } from '@/localization/constants/DateFormat';
import { isNull } from '@sniptt/guards';
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
  if (isNull(date)) {
    return '';
  }

  const formatString = getDateFormatString(dateFormat, isDateTimeInput);

  const dateTime = isDateTimeInput
    ? DateTime.fromJSDate(date, { zone: userTimezone })
    : DateTime.fromJSDate(date, { zone: 'utc' });

  const formattedDate = dateTime.toFormat(formatString);

  return formattedDate;
};
