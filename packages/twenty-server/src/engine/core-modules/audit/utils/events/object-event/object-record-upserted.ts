import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const OBJECT_RECORD_UPSERTED_EVENT = 'Object Record Upserted' as const;
export const objectRecordUpsertedSchema = z.object({
  event: z.literal(OBJECT_RECORD_UPSERTED_EVENT),
  properties: z.looseObject({}),
});

export type ObjectRecordUpsertedTrackEvent = z.infer<
  typeof objectRecordUpsertedSchema
>;

registerEvent(OBJECT_RECORD_UPSERTED_EVENT, objectRecordUpsertedSchema);
