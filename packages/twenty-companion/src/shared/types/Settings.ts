import { z } from 'zod';
import { settingsSchema } from '../validation-schemas/settingsSchema';

export type Settings = z.infer<typeof settingsSchema>;
