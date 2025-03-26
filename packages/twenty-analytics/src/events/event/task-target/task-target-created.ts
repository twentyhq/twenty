import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const taskTargetCreatedSchema = eventSchema.extend({
  action: z.literal('taskTarget.created'),
  payload: emptyPayloadSchema,
});
