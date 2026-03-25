import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const OBJECT_RECORD_CREATED_EVENT = 'Object Record Created' as const;
export const objectRecordCreatedSchema = z.object({
  event: z.literal(OBJECT_RECORD_CREATED_EVENT),
  properties: z.looseObject({}),
});

export type ObjectRecordCreatedTrackEvent = z.infer<
  typeof objectRecordCreatedSchema
>;

registerEvent(OBJECT_RECORD_CREATED_EVENT, objectRecordCreatedSchema);
