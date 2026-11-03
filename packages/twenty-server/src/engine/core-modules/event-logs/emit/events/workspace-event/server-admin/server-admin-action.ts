import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const SERVER_ADMIN_ACTION_EVENT = 'ServerAdminAction' as const;

export const serverAdminActionSchema = z.strictObject({
  event: z.literal(SERVER_ADMIN_ACTION_EVENT),
  properties: z.strictObject({
    operation: z.string(),
    operationType: z.enum(['query', 'mutation']),
    outcome: z.enum(['success', 'failure']),
    targetIds: z.record(z.string(), z.string()),
  }),
});

export type ServerAdminActionTrackEvent = z.infer<
  typeof serverAdminActionSchema
>;

registerEvent(SERVER_ADMIN_ACTION_EVENT, serverAdminActionSchema);
