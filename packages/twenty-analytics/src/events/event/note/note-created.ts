import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const noteCreatedSchema = eventSchema.extend({
  action: z.literal('note.created'),
});
