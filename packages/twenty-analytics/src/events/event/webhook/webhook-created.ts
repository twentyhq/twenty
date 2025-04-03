import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const webhookCreatedSchema = eventSchema.extend({
  action: z.literal('webhook.created'),
});
