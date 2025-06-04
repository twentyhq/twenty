import { DateFormat } from '@/localization/constants/DateFormat';
import { DateTime } from 'luxon';
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

  const parsedDate = isDateTimeInput
    ? DateTime.fromFormat(dateAsString, parsingFormat, { zone: userTimezone })
    : DateTime.fromFormat(dateAsString, parsingFormat, { zone: 'utc' });

  const isValid = parsedDate.isValid;

  if (!isValid) {
    return null;
  }

  const jsDate = parsedDate.toJSDate();

  return jsDate;
};
