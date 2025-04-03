import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const calendarEventParticipantCreatedSchema = eventSchema.extend({
  action: z.literal('calendarEventParticipant.created'),
});
