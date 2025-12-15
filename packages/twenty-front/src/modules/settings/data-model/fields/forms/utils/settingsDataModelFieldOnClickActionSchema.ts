import { z } from 'zod';

export const settingsDataModelFieldOnClickActionSchema = z.object({
  settings: z.object({
    clickAction: z.enum(['COPY', 'OPEN_LINK']).optional(),
  }),
});

export type SettingsDataModelFieldOnClickActionFormValues = z.infer<
  typeof settingsDataModelFieldOnClickActionSchema
>;
