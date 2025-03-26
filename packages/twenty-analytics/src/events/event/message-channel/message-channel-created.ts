import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const messageChannelCreatedSchema = eventSchema.extend({
  action: z.literal('messageChannel.created'),
  payload: emptyPayloadSchema,
});
