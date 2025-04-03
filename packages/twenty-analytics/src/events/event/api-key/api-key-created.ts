import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const apiKeyCreatedSchema = eventSchema.extend({
  action: z.literal('apiKey.created'),
});
