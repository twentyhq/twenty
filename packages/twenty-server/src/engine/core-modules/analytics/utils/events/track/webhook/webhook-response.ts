import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/analytics/utils/events/track/track';

export const WEBHOOK_RESPONSE_EVENT = 'Webhook Response' as const;
export const webhookResponseSchema = z
  .object({
    event: z.literal(WEBHOOK_RESPONSE_EVENT),
    properties: z
      .object({
        status: z.number().optional(),
        success: z.boolean(),
        url: z.string(),
        webhookId: z.string(),
        eventName: z.string(),
      })
      .strict(),
  })
  .strict();

export type WebhookResponseTrackEvent = z.infer<typeof webhookResponseSchema>;

registerEvent(WEBHOOK_RESPONSE_EVENT, webhookResponseSchema);
