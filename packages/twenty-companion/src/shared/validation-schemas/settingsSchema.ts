import { preferencesSchema } from './preferencesSchema';
import { z } from 'zod';

export const settingsSchema = preferencesSchema.extend({
  setupCompleted: z.boolean(),
});
