import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const OBJECT_RECORD_DESTROYED_EVENT = 'Object Record Destroyed' as const;
export const objectRecordDestroyedSchema = z.object({
  event: z.literal(OBJECT_RECORD_DESTROYED_EVENT),
  properties: z.looseObject({}),
});

export type ObjectRecordDestroyedTrackEvent = z.infer<
  typeof objectRecordDestroyedSchema
>;

registerEvent(OBJECT_RECORD_DESTROYED_EVENT, objectRecordDestroyedSchema);
