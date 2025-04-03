import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const webhookCreatedSchema = eventSchema.extend({
  action: z.literal('webhook.created'),
  payload: emptyPayloadSchema,
});
