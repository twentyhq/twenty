import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const personCreatedSchema = eventSchema.extend({
  action: z.literal('person.created'),
});
