import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const blocklistCreatedSchema = eventSchema.extend({
  action: z.literal('blocklist.created'),
});
