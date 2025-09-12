import { type DateFormat } from '@/localization/constants/DateFormat';
import { isValid, parse } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';
import { getDateFormatString } from '~/utils/date-utils';

type ParseStringToDateArgs = {
  dateAsString: string;
  isDateTimeInput: boolean;
  userTimezone: string | undefined;
  dateFormat: DateFormat;
};

export const parseStringToDate = ({
  dateAsString,
  isDateTimeInput,
  userTimezone,
  dateFormat,
}: ParseStringToDateArgs) => {
  const parsingFormat = getDateFormatString(dateFormat, isDateTimeInput);
  const referenceDate = new Date();

  const parsedDate = parse(dateAsString, parsingFormat, referenceDate);

  if (!isValid(parsedDate)) {
    return null;
  }

  if (isDateTimeInput && isDefined(userTimezone)) {
    return zonedTimeToUtc(parsedDate, userTimezone);
  }

  return parsedDate;
};
