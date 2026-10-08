import { FIELD_LINKS_VARIANTS } from 'twenty-shared/types';
import { z } from 'zod';

export const settingsDataModelFieldLinksVariantSchema = z.object({
  settings: z.object({
    type: z.enum(FIELD_LINKS_VARIANTS).optional(),
  }),
});

export type SettingsDataModelFieldLinksVariantFormValues = z.infer<
  typeof settingsDataModelFieldLinksVariantSchema
>;
