import { z } from 'zod';

export const settingsDataModelFieldActionModeSchema = z.object({
  settings: z.object({
    actionMode: z.enum(['copy', 'navigate']).optional(),
  }),
});

export type SettingsDataModelFieldActionModeFormValues = z.infer<
  typeof settingsDataModelFieldActionModeSchema
>;
