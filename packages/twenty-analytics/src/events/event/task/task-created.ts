import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const taskCreatedSchema = eventSchema.extend({
  action: z.literal('task.created'),
});
