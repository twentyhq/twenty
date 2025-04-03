import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const messageThreadCreatedSchema = eventSchema.extend({
  action: z.literal('messageThread.created'),
});
