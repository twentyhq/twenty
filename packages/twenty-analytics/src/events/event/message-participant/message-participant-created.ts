import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const messageParticipantCreatedSchema = eventSchema.extend({
  action: z.literal('messageParticipant.created'),
  payload: emptyPayloadSchema,
});
