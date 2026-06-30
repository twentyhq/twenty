import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const SERVER_ADMIN_ACCESS_CHANGED_EVENT =
  'ServerAdminAccessChanged' as const;

export const serverAdminAccessChangedSchema = z.strictObject({
  event: z.literal(SERVER_ADMIN_ACCESS_CHANGED_EVENT),
  properties: z.strictObject({
    targetUserId: z.string(),
    canAccessFullAdminPanel: z.boolean(),
    canImpersonate: z.boolean(),
    message: z.string().optional(),
  }),
});

export type ServerAdminAccessChangedTrackEvent = z.infer<
  typeof serverAdminAccessChangedSchema
>;

registerEvent(
  SERVER_ADMIN_ACCESS_CHANGED_EVENT,
  serverAdminAccessChangedSchema,
);
