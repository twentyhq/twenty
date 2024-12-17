import { DATE_PARSER_FORMAT } from '@/ui/input/components/internal/date/constants/DateParserFormat';
import { DATE_TIME_PARSER_FORMAT } from '@/ui/input/components/internal/date/constants/DateTimeParserFormat';
import { DateTime } from 'luxon';

type ParseDateToStringArgs = {
  date: Date;
  isDateTimeInput: boolean;
  userTimezone: string | undefined;
};

export const parseDateToString = ({
  date,
  isDateTimeInput,
  userTimezone,
}: ParseDateToStringArgs) => {
  const parsingFormat = isDateTimeInput
    ? DATE_TIME_PARSER_FORMAT
    : DATE_PARSER_FORMAT;

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
