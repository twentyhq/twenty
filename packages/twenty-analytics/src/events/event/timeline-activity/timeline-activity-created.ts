import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const timelineActivityCreatedSchema = eventSchema.extend({
  action: z.literal('timelineActivity.created'),
});
