import { z } from 'zod';

export const settingsDataModelFieldOnClickActionSchema = z.object({
  settings: z.object({
    clickAction: z.enum(['COPY', 'OPEN_LINK', 'OPEN_IN_APP']).optional(),
  }),
});

export type SettingsDataModelFieldOnClickActionFormValues = z.infer<
  typeof settingsDataModelFieldOnClickActionSchema
>;
