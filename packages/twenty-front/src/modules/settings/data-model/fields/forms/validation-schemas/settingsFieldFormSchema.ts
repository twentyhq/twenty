import { settingsDataModelFieldDescriptionFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { settingsDataModelFieldIconLabelFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { settingsDataModelFieldSettingsFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { z } from 'zod';
import { settingsDataModelFieldTypeFormSchema } from '~/pages/settings/data-model/new-field/SettingsObjectNewFieldSelect';

export const settingsFieldFormSchema = (existingOtherLabels?: string[]) => {
  return z
    .object({})
    .extend(
      settingsDataModelFieldIconLabelFormSchema(existingOtherLabels).shape,
    )
    .extend(settingsDataModelFieldDescriptionFormSchema().shape)
    .extend(settingsDataModelFieldTypeFormSchema.shape)
    .and(settingsDataModelFieldSettingsFormSchema);
};
