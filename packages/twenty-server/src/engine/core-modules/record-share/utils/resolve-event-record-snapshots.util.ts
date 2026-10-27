/* @license Enterprise */

import {
  type ObjectRecordBaseEvent,
  type ObjectRecordEvent,
} from 'twenty-shared/database-events';

import { type RowAccessRecord } from 'src/engine/core-modules/record-share/utils/evaluate-row-access-policy.util';

export const resolveEventRecordSnapshots = (
  events: ObjectRecordEvent[],
): RowAccessRecord[] =>
  events.map((event) => {
    const properties = event.properties as ObjectRecordBaseEvent['properties'];

    return {
      ...(properties.after ?? properties.before ?? {}),
      id: event.recordId,
    };
  });
