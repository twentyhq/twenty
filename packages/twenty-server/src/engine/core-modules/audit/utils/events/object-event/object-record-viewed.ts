import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const OBJECT_RECORD_VIEWED_EVENT = 'Object Record Viewed' as const;
export const objectRecordViewedSchema = z.object({
  event: z.literal(OBJECT_RECORD_VIEWED_EVENT),
  properties: z.object({
    recordId: z.string(),
    objectMetadataId: z.string(),
  }),
});

export type ObjectRecordViewedTrackEvent = z.infer<
  typeof objectRecordViewedSchema
>;

registerEvent(OBJECT_RECORD_VIEWED_EVENT, objectRecordViewedSchema);
