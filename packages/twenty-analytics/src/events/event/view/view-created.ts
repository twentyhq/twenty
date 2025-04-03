import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const viewCreatedSchema = eventSchema.extend({
  action: z.literal('view.created'),
});
