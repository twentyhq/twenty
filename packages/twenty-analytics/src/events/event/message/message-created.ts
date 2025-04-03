import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const messageCreatedSchema = eventSchema.extend({
  action: z.literal('message.created'),
});
