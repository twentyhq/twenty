import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const auditLogCreatedSchema = eventSchema.extend({
  action: z.literal('auditLog.created'),
  payload: emptyPayloadSchema,
});
