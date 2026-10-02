/* @license Enterprise */

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShareGrant } from 'src/engine/core-modules/record-share/types/record-share-grant.type';
import { type RecordShareGrantsAtDestroyCarrier } from 'src/engine/core-modules/record-share/types/record-share-grants-at-destroy.type';

// Destroyed records lost their shares with them, so their events are gated on
// the grants captured at destroy time
export const resolveRecordShareGrantsAtDestroyByRecordId = (
  events: ObjectRecordEvent[],
): Map<string, RecordShareGrant[]> =>
  new Map(
    events.flatMap((event) => {
      const { recordShareGrantsAtDestroy } =
        event.properties as RecordShareGrantsAtDestroyCarrier;

      return isDefined(recordShareGrantsAtDestroy)
        ? [[event.recordId, recordShareGrantsAtDestroy] as const]
        : [];
    }),
  );
