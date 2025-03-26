import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const calendarEventParticipantCreatedSchema = eventSchema.extend({
  action: z.literal('calendarEventParticipant.created'),
  payload: emptyPayloadSchema,
});
