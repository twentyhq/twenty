import { isNonEmptyString } from '@sniptt/guards';

export const getUnambiguousCalendarEventId = (
  calendarEventIds: (string | null)[],
): string | undefined => {
  const uniqueCalendarEventIds = [
    ...new Set(calendarEventIds.filter(isNonEmptyString)),
  ];
  return uniqueCalendarEventIds.length === 1
    ? uniqueCalendarEventIds[0]
    : undefined;
};
