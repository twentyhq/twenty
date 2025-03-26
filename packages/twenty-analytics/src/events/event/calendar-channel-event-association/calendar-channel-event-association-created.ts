import { z } from 'zod';
import { eventSchema, emptyPayloadSchema } from '../common/base-schemas';

export const calendarChannelEventAssociationCreatedSchema = eventSchema.extend({
  action: z.literal('calendarChannelEventAssociation.created'),
  payload: emptyPayloadSchema,
});
