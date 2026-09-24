import { z } from 'zod';

export const GRANOLA_SETTINGS_FOLDER_SCHEMA = z.object({
  id: z.string(),
  name: z.string(),
  parent_folder_id: z.string().nullable(),
});

export type GranolaSettingsFolder = z.infer<
  typeof GRANOLA_SETTINGS_FOLDER_SCHEMA
>;
