import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const opportunityCreatedSchema = eventSchema.extend({
  action: z.literal('opportunity.created'),
  payload: emptyPayloadSchema,
});
