import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const workspaceMemberCreatedSchema = eventSchema.extend({
  action: z.literal('workspaceMember.created'),
  payload: emptyPayloadSchema,
});
