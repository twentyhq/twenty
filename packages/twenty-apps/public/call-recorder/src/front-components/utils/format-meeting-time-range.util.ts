import { isUndefined } from '@sniptt/guards';

import { createDateTimeFormat } from 'src/front-components/utils/create-date-time-format.util';
import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';

const MEETING_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

export const formatMeetingTimeRange = ({
  startsAt,
  endsAt,
  locale,
}: {
  startsAt: string | null | undefined;
  endsAt: string | null | undefined;
  locale: string | undefined;
}): string | undefined => {
  const startTimestamp = getTimestamp(startsAt);

  if (isUndefined(startTimestamp)) {
    return undefined;
  }

  const dateTimeFormat = createDateTimeFormat({
    locale,
    formatOptions: MEETING_TIME_FORMAT_OPTIONS,
  });
  const endTimestamp = getTimestamp(endsAt);

  return isUndefined(endTimestamp) || endTimestamp < startTimestamp
    ? dateTimeFormat.format(startTimestamp)
    : dateTimeFormat.formatRange(startTimestamp, endTimestamp);
};
