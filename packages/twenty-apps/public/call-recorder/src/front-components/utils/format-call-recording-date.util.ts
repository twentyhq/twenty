import { isUndefined } from '@sniptt/guards';

import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';

const CALL_RECORDING_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const createDateTimeFormat = (locale: string | undefined) => {
  try {
    return new Intl.DateTimeFormat(locale, CALL_RECORDING_DATE_FORMAT_OPTIONS);
  } catch {
    // Host locales such as pseudo-locales are not always valid BCP 47 tags.
    return new Intl.DateTimeFormat(
      undefined,
      CALL_RECORDING_DATE_FORMAT_OPTIONS,
    );
  }
};

export const formatCallRecordingDate = ({
  dateTime,
  locale,
}: {
  dateTime: string | null | undefined;
  locale: string | undefined;
}): string | undefined => {
  const timestamp = getTimestamp(dateTime);

  if (isUndefined(timestamp)) {
    return undefined;
  }

  return createDateTimeFormat(locale).format(timestamp);
};
