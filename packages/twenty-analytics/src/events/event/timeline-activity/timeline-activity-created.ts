import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const timelineActivityCreatedSchema = eventSchema.extend({
  action: z.literal('timelineActivity.created'),
  payload: emptyPayloadSchema,
});
