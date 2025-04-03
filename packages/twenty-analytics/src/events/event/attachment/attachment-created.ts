import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const attachmentCreatedSchema = eventSchema.extend({
  action: z.literal('attachment.created'),
});
