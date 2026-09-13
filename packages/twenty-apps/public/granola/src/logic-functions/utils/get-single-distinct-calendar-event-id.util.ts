import { isNonEmptyString } from '@sniptt/guards';

export const getSingleDistinctCalendarEventId = (
  calendarEventIds: (string | null)[],
): string | undefined => {
  const distinctCalendarEventIds = [
    ...new Set(calendarEventIds.filter(isNonEmptyString)),
  ];

  if (distinctCalendarEventIds.length !== 1) {
    return undefined;
  }

  return distinctCalendarEventIds[0];
};
