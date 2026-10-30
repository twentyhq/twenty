import { isUndefined } from '@sniptt/guards';

import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';

const CURRENT_YEAR_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

const OTHER_YEAR_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const dateTimeFormatByKey = new Map<string, Intl.DateTimeFormat>();

const createDateTimeFormat = ({
  locale,
  formatOptions,
}: {
  locale: string | undefined;
  formatOptions: Intl.DateTimeFormatOptions;
}) => {
  try {
    return new Intl.DateTimeFormat(locale, formatOptions);
  } catch {
    // Host locales such as pseudo-locales are not always valid BCP 47 tags.
    return new Intl.DateTimeFormat(undefined, formatOptions);
  }
};

const getDateTimeFormat = ({
  locale,
  isCurrentYear,
}: {
  locale: string | undefined;
  isCurrentYear: boolean;
}) => {
  const formatKey = `${locale ?? ''}:${isCurrentYear}`;
  const cachedDateTimeFormat = dateTimeFormatByKey.get(formatKey);

  if (!isUndefined(cachedDateTimeFormat)) {
    return cachedDateTimeFormat;
  }

  const dateTimeFormat = createDateTimeFormat({
    locale,
    formatOptions: isCurrentYear
      ? CURRENT_YEAR_DATE_FORMAT_OPTIONS
      : OTHER_YEAR_DATE_FORMAT_OPTIONS,
  });

  dateTimeFormatByKey.set(formatKey, dateTimeFormat);

  return dateTimeFormat;
};

export const formatCallRecordingDate = ({
  dateTime,
  locale,
  now = new Date(),
}: {
  dateTime: string | null | undefined;
  locale: string | undefined;
  now?: Date;
}): string | undefined => {
  const timestamp = getTimestamp(dateTime);

  if (isUndefined(timestamp)) {
    return undefined;
  }

  const isCurrentYear = new Date(timestamp).getFullYear() === now.getFullYear();

  return getDateTimeFormat({ locale, isCurrentYear }).format(timestamp);
};
