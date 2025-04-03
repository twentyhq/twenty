import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const noteTargetCreatedSchema = eventSchema.extend({
  action: z.literal('noteTarget.created'),
  payload: emptyPayloadSchema,
});
