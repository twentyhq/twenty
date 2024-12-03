import { settingsDataModelFieldDescriptionFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { settingsDataModelFieldSettingsFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { z } from 'zod';
import { settingsDataModelFieldTypeFormSchema } from '~/pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldSelect';

export const settingsFieldFormSchema = (existingOtherLabels?: string[]) => {
  return (
    z
      .object({})
      // .merge(settingsDataModelFieldIconLabelFormSchema(existingOtherLabels))
      .merge(settingsDataModelFieldDescriptionFormSchema())
      .merge(settingsDataModelFieldTypeFormSchema)
      .and(settingsDataModelFieldSettingsFormSchema)
  );
};
