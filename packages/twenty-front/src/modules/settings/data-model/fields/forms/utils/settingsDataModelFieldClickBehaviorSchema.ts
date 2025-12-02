import { z } from 'zod';

export const settingsDataModelFieldClickBehaviorSchema = z.object({
  settings: z.object({
    clickAction: z.enum(['COPY', 'OPEN_LINK']).optional(),
  }),
});

export type SettingsDataModelFieldClickBehaviorFormValues = z.infer<
  typeof settingsDataModelFieldClickBehaviorSchema
>;
