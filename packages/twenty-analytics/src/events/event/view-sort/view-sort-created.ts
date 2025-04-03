import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const viewSortCreatedSchema = eventSchema.extend({
  action: z.literal('viewSort.created'),
  payload: emptyPayloadSchema,
});
