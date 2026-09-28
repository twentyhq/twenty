import { isDefined } from 'twenty-sdk/utils';

import { type GraphDateTimeTimeZone } from 'src/features/transcripts/logic-functions/types/graph-date-time-time-zone.type';

export const parseGraphUtcDateTime = (
  dateTimeTimeZone: GraphDateTimeTimeZone | null | undefined,
): string | undefined => {
  if (!isDefined(dateTimeTimeZone)) {
    return undefined;
  }

  const milliseconds = Date.parse(`${dateTimeTimeZone.dateTime}Z`);

  return Number.isFinite(milliseconds)
    ? new Date(milliseconds).toISOString()
    : undefined;
};
