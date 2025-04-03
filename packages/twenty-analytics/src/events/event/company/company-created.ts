import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const companyCreatedSchema = eventSchema.extend({
  action: z.literal('company.created'),
  payload: emptyPayloadSchema,
});
