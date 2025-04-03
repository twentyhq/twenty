import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const companyCreatedSchema = eventSchema.extend({
  action: z.literal('company.created'),
});
