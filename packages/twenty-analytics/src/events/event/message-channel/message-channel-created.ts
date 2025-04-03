import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const messageChannelCreatedSchema = eventSchema.extend({
  action: z.literal('messageChannel.created'),
});
