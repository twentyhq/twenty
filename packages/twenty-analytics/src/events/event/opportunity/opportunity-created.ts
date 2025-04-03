import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const opportunityCreatedSchema = eventSchema.extend({
  action: z.literal('opportunity.created'),
});
