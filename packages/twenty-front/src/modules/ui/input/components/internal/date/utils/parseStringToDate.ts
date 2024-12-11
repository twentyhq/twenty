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
  const parsingFormat = isDateTimeInput ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy';

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
