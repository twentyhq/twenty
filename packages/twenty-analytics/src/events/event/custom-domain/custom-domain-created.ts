import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const customDomainCreatedSchema = eventSchema.extend({
  action: z.literal('customDomain.created'),
});
