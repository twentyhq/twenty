import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const IMPERSONATION_EVENT = 'Impersonation' as const;

export const impersonationSchema = z.strictObject({
  event: z.literal(IMPERSONATION_EVENT),
  properties: z.strictObject({
    level: z.enum(['server', 'workspace']),
    action: z.enum([
      'attempt',
      'attempted',
      'issued',
      'login_token_attempt',
      'login_token_generated',
      'login_token_failed',
      'token_exchange_attempt',
      'token_exchange_success',
      'token_exchange_failed',
    ]),
    message: z.string().optional(),
  }),
});

export type ImpersonationTrackEvent = z.infer<typeof impersonationSchema>;

registerEvent(IMPERSONATION_EVENT, impersonationSchema);
