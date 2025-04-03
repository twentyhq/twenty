import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const calendarChannelCreatedSchema = eventSchema.extend({
  action: z.literal('calendarChannel.created'),
  payload: emptyPayloadSchema,
});
