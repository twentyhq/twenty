import { z } from 'zod';

import { settingsDataModelFieldDescriptionFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { settingsDataModelFieldIconLabelFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { settingsDataModelFieldSettingsFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { settingsDataModelFieldTypeFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';

export const settingsFieldFormSchema = (existingLabels?: string[]) => {
  return z
    .object({})
    .merge(settingsDataModelFieldIconLabelFormSchema(existingLabels))
    .merge(settingsDataModelFieldDescriptionFormSchema())
    .merge(settingsDataModelFieldTypeFormSchema)
    .and(settingsDataModelFieldSettingsFormSchema);
};
