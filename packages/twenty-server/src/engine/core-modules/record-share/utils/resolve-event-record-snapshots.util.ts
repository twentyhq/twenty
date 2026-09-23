import {
  type ObjectRecordBaseEvent,
  type ObjectRecordEvent,
} from 'twenty-shared/database-events';

import {
  type InheritedReadabilityChildRecords,
  type InheritedReadabilityChildRecordsCarrier,
} from 'src/engine/core-modules/record-share/types/inherited-readability-child-records.type';

export type EventRecordSnapshot = {
  id: string;
  inheritedReadabilityChildRecords?: InheritedReadabilityChildRecords;
} & Record<string, unknown>;

export const resolveEventRecordSnapshots = (
  events: ObjectRecordEvent[],
): EventRecordSnapshot[] =>
  events.map((event) => {
    const properties = event.properties as ObjectRecordBaseEvent['properties'] &
      InheritedReadabilityChildRecordsCarrier;

    return {
      ...(properties.after ?? properties.before ?? {}),
      id: event.recordId,
      inheritedReadabilityChildRecords:
        properties.inheritedReadabilityChildRecords,
    };
  });
