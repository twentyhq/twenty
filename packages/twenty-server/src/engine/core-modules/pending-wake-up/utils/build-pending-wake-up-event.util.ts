import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';

export const buildPendingWakeUpEvent = ({
  eventName,
  event,
}: {
  eventName: string;
  event: ObjectRecordEvent;
}): PendingWakeUpEvent => {
  // every event shape carries a subset of these
  const { before, after, updatedFields } = event.properties as {
    before?: object;
    after?: object;
    updatedFields?: string[];
  };

  return {
    eventName,
    recordId: event.recordId,
    record: (after ?? before ?? {}) as Record<string, unknown>,
    ...(isDefined(after) && isDefined(before)
      ? { before: before as Record<string, unknown> }
      : {}),
    ...(isDefined(updatedFields) ? { updatedFields } : {}),
  };
};
