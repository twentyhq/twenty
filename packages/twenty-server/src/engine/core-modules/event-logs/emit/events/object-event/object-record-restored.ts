import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const OBJECT_RECORD_RESTORED_EVENT = 'Object Record Restored' as const;
export const objectRecordRestoredSchema = z.object({
  event: z.literal(OBJECT_RECORD_RESTORED_EVENT),
  properties: z.looseObject({}),
});

export type ObjectRecordRestoredTrackEvent = z.infer<
  typeof objectRecordRestoredSchema
>;

registerEvent(OBJECT_RECORD_RESTORED_EVENT, objectRecordRestoredSchema);
