import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type InheritedReadabilityChildRecordsCarrier } from 'src/engine/core-modules/record-share/types/inherited-readability-child-records.type';

export const omitInheritedReadabilityChildRecords = <
  TEvent extends ObjectRecordEvent,
>(
  event: TEvent,
): TEvent => {
  const { inheritedReadabilityChildRecords, ...properties } =
    event.properties as TEvent['properties'] &
      InheritedReadabilityChildRecordsCarrier;

  return isDefined(inheritedReadabilityChildRecords)
    ? ({ ...event, properties } as TEvent)
    : event;
};
