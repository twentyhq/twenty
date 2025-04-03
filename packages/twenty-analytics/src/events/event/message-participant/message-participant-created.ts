import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const messageParticipantCreatedSchema = eventSchema.extend({
  action: z.literal('messageParticipant.created'),
});
