import { DATE_PARSER_FORMAT } from '@/ui/input/components/internal/date/constants/DateParserFormat';
import { DATE_TIME_PARSER_FORMAT } from '@/ui/input/components/internal/date/constants/DateTimeParserFormat';
import { DateTime } from 'luxon';

type ParseStringToDateArgs = {
  dateAsString: string;
  isDateTimeInput: boolean;
  userTimezone: string | undefined;
};

export const parseStringToDate = ({
  dateAsString,
  isDateTimeInput,
  userTimezone,
}: ParseStringToDateArgs) => {
  const parsingFormat = isDateTimeInput
    ? DATE_TIME_PARSER_FORMAT
    : DATE_PARSER_FORMAT;

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
