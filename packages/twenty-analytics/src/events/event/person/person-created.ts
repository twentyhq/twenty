import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const personCreatedSchema = eventSchema.extend({
  action: z.literal('person.created'),
  payload: emptyPayloadSchema,
});
