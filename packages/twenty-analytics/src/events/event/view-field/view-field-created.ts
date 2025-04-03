import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const viewFieldCreatedSchema = eventSchema.extend({
  action: z.literal('viewField.created'),
});
