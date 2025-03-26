import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const messageThreadCreatedSchema = eventSchema.extend({
  action: z.literal('messageThread.created'),
  payload: emptyPayloadSchema,
});
