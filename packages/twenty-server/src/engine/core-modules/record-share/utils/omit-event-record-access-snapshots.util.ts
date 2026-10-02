/* @license Enterprise */

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type InheritedReadabilityChildRecordsCarrier } from 'src/engine/core-modules/record-share/types/inherited-readability-child-records.type';
import { type RecordShareGrantsAtDestroyCarrier } from 'src/engine/core-modules/record-share/types/record-share-grants-at-destroy.type';

export const omitEventRecordAccessSnapshots = <
  TEvent extends ObjectRecordEvent,
>(
  event: TEvent,
): TEvent => {
  const {
    inheritedReadabilityChildRecords,
    recordShareGrantsAtDestroy,
    ...properties
  } = event.properties as TEvent['properties'] &
    InheritedReadabilityChildRecordsCarrier &
    RecordShareGrantsAtDestroyCarrier;

  return isDefined(inheritedReadabilityChildRecords) ||
    isDefined(recordShareGrantsAtDestroy)
    ? ({ ...event, properties } as TEvent)
    : event;
};
