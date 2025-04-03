import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const calendarEventCreatedSchema = eventSchema.extend({
  action: z.literal('calendarEvent.created'),
  payload: emptyPayloadSchema,
});
