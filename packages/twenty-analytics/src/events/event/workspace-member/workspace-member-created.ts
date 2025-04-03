import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const workspaceMemberCreatedSchema = eventSchema.extend({
  action: z.literal('workspaceMember.created'),
});
