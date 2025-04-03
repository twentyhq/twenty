import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const customDomainActivatedSchema = eventSchema.extend({
  action: z.literal('customDomain.activated'),
  payload: emptyPayloadSchema,
});