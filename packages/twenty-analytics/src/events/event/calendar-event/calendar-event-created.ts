import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const calendarEventCreatedSchema = eventSchema.extend({
  action: z.literal('calendarEvent.created'),
});
