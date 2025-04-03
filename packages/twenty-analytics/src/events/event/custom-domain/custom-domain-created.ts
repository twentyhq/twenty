import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const customDomainCreatedSchema = eventSchema.extend({
  action: z.literal('customDomain.created'),
  payload: emptyPayloadSchema,
});