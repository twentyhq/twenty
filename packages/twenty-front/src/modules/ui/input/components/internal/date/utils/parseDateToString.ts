import { DateFormat } from '@/localization/constants/DateFormat';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';
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

  if (isDateTimeInput && isDefined(userTimezone)) {
    return formatInTimeZone(date, userTimezone, parsingFormat);
  } else if (isDateTimeInput) {
    return format(date, parsingFormat);
  } else {
    const dateWithoutTime = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    return format(dateWithoutTime, parsingFormat);
  }
};
