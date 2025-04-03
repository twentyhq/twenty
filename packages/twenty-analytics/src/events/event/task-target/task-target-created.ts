import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const taskTargetCreatedSchema = eventSchema.extend({
  action: z.literal('taskTarget.created'),
});
