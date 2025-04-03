import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const viewFilterCreatedSchema = eventSchema.extend({
  action: z.literal('viewFilter.created'),
});
