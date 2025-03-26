import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const noteCreatedSchema = eventSchema.extend({
  action: z.literal('note.created'),
  payload: emptyPayloadSchema,
});
