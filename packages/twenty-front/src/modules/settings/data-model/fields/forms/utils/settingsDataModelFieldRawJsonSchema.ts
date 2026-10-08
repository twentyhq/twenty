import { z } from 'zod';

export const settingsDataModelFieldRawJsonSchema = z.object({
  settings: z
    .object({ isValueLoadedOnOpen: z.boolean().optional() })
    .passthrough()
    .nullish(),
});

export type SettingsDataModelFieldRawJsonFormValues = z.infer<
  typeof settingsDataModelFieldRawJsonSchema
>;
