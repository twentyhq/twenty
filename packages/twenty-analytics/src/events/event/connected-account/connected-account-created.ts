import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const connectedAccountCreatedSchema = eventSchema.extend({
  action: z.literal('connectedAccount.created'),
  payload: emptyPayloadSchema,
});
