import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const favoriteCreatedSchema = eventSchema.extend({
  action: z.literal('favorite.created'),
});
