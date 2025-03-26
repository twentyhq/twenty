import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const favoriteCreatedSchema = eventSchema.extend({
  action: z.literal('favorite.created'),
  payload: emptyPayloadSchema,
});
