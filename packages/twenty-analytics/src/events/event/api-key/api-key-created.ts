import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const apiKeyCreatedSchema = eventSchema.extend({
  action: z.literal('apiKey.created'),
  payload: emptyPayloadSchema,
});
