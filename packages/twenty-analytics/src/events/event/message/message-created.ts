import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const messageCreatedSchema = eventSchema.extend({
  action: z.literal('message.created'),
  payload: emptyPayloadSchema,
});
