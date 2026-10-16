export const groupCalendarEventIdsByKey = (
  entries: [string, string][],
): Map<string, Set<string>> => {
  const calendarEventIdsByKey = new Map<string, Set<string>>();

  for (const [key, calendarEventId] of entries) {
    calendarEventIdsByKey.set(
      key,
      (calendarEventIdsByKey.get(key) ?? new Set<string>()).add(
        calendarEventId,
      ),
    );
  }

  return calendarEventIdsByKey;
};
