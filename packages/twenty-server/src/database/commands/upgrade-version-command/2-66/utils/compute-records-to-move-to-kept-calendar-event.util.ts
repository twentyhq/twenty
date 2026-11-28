import { isDefined } from 'twenty-shared/utils';

import { type CalendarEventRecordMove } from 'src/database/commands/upgrade-version-command/2-66/types/calendar-event-record-move.type';

export const computeRecordsToMoveToKeptCalendarEvent = <
  TRecord extends { id: string; calendarEventId: string },
>({
  records,
  keptCalendarEventIdByDuplicateId,
  getRecordKey,
}: {
  records: TRecord[];
  keptCalendarEventIdByDuplicateId: Map<string, string>;
  getRecordKey: (record: TRecord) => string;
}): CalendarEventRecordMove[] => {
  const recordKeysOnKeptEvents = new Set(
    records
      .filter(
        ({ calendarEventId }) =>
          !keptCalendarEventIdByDuplicateId.has(calendarEventId),
      )
      .map((record) => `${record.calendarEventId}:${getRecordKey(record)}`),
  );

  return records.flatMap((record) => {
    const keptCalendarEventId = keptCalendarEventIdByDuplicateId.get(
      record.calendarEventId,
    );

    if (!isDefined(keptCalendarEventId)) {
      return [];
    }

    const recordKeyOnKeptEvent = `${keptCalendarEventId}:${getRecordKey(record)}`;

    if (recordKeysOnKeptEvents.has(recordKeyOnKeptEvent)) {
      return [];
    }

    recordKeysOnKeptEvents.add(recordKeyOnKeptEvent);

    return [{ id: record.id, keptCalendarEventId }];
  });
};
