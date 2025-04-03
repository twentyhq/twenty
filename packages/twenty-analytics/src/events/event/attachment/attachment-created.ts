import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const attachmentCreatedSchema = eventSchema.extend({
  action: z.literal('attachment.created'),
  payload: emptyPayloadSchema,
});
