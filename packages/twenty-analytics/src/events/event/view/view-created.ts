import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const viewCreatedSchema = eventSchema.extend({
  action: z.literal('view.created'),
  payload: emptyPayloadSchema,
});
