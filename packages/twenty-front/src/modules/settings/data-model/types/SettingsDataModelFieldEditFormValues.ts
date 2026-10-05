import type { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { type z } from 'zod';

// TODO: Remove `any` once every field-settings form uses the discriminated schema.
export type SettingsDataModelFieldEditFormValues = z.infer<
  ReturnType<typeof settingsFieldFormSchema>
> &
  any;
