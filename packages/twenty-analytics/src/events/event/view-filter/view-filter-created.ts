import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const viewFilterCreatedSchema = eventSchema.extend({
  action: z.literal('viewFilter.created'),
  payload: emptyPayloadSchema,
});
