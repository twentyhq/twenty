import { z } from 'zod';

import { settingsDataModelFieldAboutFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldAboutForm';
import { settingsDataModelFieldSettingsFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsDataModelFieldTypeFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';

export const settingsFieldFormSchema = z
  .object({})
  .merge(settingsDataModelFieldAboutFormSchema)
  .merge(settingsDataModelFieldTypeFormSchema)
  .and(settingsDataModelFieldSettingsFormSchema);
