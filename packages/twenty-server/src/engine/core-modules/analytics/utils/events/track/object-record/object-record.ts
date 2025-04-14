import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/analytics/utils/events/track/track';

export const OBJECT_RECORD_EVENT = 'Object Record' as const;
export const objectRecordScheam = z.object({
  event: z.literal(OBJECT_RECORD_EVENT),
  properties: z.object({}),
});

export type ObjectRecordTrackEvent = z.infer<typeof objectRecordScheam>;

registerEvent(OBJECT_RECORD_EVENT, objectRecordScheam);
