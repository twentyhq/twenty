import { z } from 'zod';

import { eventSchema } from 'src/engine/core-modules/analytics/utils/event/common/base-schemas';

export const webhookResponseSchema = eventSchema.extend({
  action: z.literal('webhook.response'),
  payload: z
    .object({
      status: z.number().optional(),
      success: z.boolean(),
      url: z.string(),
      webhookId: z.string(),
      eventName: z.string(),
    })
    .strict(),
});
