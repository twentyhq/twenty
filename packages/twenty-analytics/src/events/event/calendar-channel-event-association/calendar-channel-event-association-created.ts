import { z } from 'zod';
import { eventSchema } from '../common/base-schemas';

export const calendarChannelEventAssociationCreatedSchema = eventSchema.extend({
  action: z.literal('calendarChannelEventAssociation.created'),
});
