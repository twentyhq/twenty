import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const messageChannelMessageAssociationCreatedSchema = eventSchema.extend(
  {
    action: z.literal('messageChannelMessageAssociation.created'),
    payload: emptyPayloadSchema,
  },
);
