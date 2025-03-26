import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const taskCreatedSchema = eventSchema.extend({
  action: z.literal('task.created'),
  payload: emptyPayloadSchema,
});
