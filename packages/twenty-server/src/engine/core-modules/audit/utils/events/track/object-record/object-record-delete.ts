import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/track/track';

export const OBJECT_RECORD_DELETED_EVENT = 'Object Record Deleted' as const;
export const objectRecordDeletedSchema = z.object({
  event: z.literal(OBJECT_RECORD_DELETED_EVENT),
  properties: z.object({}).passthrough(),
});

export type ObjectRecordDeletedTrackEvent = z.infer<
  typeof objectRecordDeletedSchema
>;

registerEvent(OBJECT_RECORD_DELETED_EVENT, objectRecordDeletedSchema);
