import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const blocklistCreatedSchema = eventSchema.extend({
  action: z.literal('blocklist.created'),
  payload: emptyPayloadSchema,
});
