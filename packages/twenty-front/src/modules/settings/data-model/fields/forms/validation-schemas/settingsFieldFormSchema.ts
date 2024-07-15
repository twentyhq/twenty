import { z } from 'zod';

import { settingsDataModelFieldAboutFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldAboutForm';
import { settingsDataModelFieldSettingsFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsDataModelFieldTypeFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';

export const settingsFieldFormSchema = (existingLabels?: string[]) => {
  return z
    .object({})
    .merge(settingsDataModelFieldAboutFormSchema(existingLabels))
    .merge(settingsDataModelFieldTypeFormSchema)
    .and(settingsDataModelFieldSettingsFormSchema);
};
