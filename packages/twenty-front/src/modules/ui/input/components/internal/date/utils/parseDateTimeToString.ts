import { DateFormat } from '@/localization/constants/DateFormat';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';
import { getDateTimeFormatString } from '~/utils/date-utils';

type ParseDateTimeToStringArgs = {
  date: Date;
  userTimezone: string | undefined;
  dateFormat?: DateFormat;
};

export const parseDateTimeToString = ({
  date,
  userTimezone,
  dateFormat = DateFormat.MONTH_FIRST,
}: ParseDateTimeToStringArgs) => {
  const parsingFormat = getDateTimeFormatString(dateFormat);

  if (isDefined(userTimezone)) {
    return formatInTimeZone(date, userTimezone, parsingFormat);
  } else {
    return format(date, parsingFormat);
  }
};
