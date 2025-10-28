import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const WEBHOOK_RESPONSE_EVENT = 'Webhook Response' as const;
export const webhookResponseSchema = z.strictObject({
  event: z.literal(WEBHOOK_RESPONSE_EVENT),
  properties: z.strictObject({
    status: z.number().optional(),
    success: z.boolean(),
    url: z.string(),
    webhookId: z.string(),
    eventName: z.string(),
  }),
});

export type WebhookResponseTrackEvent = z.infer<typeof webhookResponseSchema>;

registerEvent(WEBHOOK_RESPONSE_EVENT, webhookResponseSchema);
