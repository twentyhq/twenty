import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const calendarChannelCreatedSchema = eventSchema.extend({
  action: z.literal('calendarChannel.created'),
});
