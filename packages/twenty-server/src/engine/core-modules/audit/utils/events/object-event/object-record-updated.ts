import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const OBJECT_RECORD_UPDATED_EVENT = 'Object Record Updated' as const;
export const objectRecordUpdatedSchema = z.object({
  event: z.literal(OBJECT_RECORD_UPDATED_EVENT),
  properties: z.looseObject({}),
});

export type ObjectRecordUpdatedTrackEvent = z.infer<
  typeof objectRecordUpdatedSchema
>;

registerEvent(OBJECT_RECORD_UPDATED_EVENT, objectRecordUpdatedSchema);
