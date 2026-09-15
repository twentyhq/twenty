import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const AUTH_SESSION_EVENT = 'AuthSession' as const;

export const authSessionSchema = z.strictObject({
  event: z.literal(AUTH_SESSION_EVENT),
  properties: z.strictObject({
    action: z.enum(['user_signed_in', 'user_signed_out', 'session_revoked']),
    message: z.string().optional(),
  }),
});

export type AuthSessionTrackEvent = z.infer<typeof authSessionSchema>;

registerEvent(AUTH_SESSION_EVENT, authSessionSchema);
