import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const customDomainActivatedSchema = eventSchema.extend({
  action: z.literal('customDomain.activated'),
});
