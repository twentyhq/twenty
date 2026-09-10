import { useState } from 'react';
import {
  settingsAiAgentFormSchema,
  type SettingsAiAgentFormValues,
} from '~/pages/settings/ai/validation-schemas/settingsAiAgentFormSchema';

export const useSettingsAgentFormState = (
  initialValues: SettingsAiAgentFormValues,
) => {
  const [formValues, setFormValues] =
    useState<SettingsAiAgentFormValues>(initialValues);
  const validateForm = (): boolean =>
    settingsAiAgentFormSchema.safeParse(formValues).success;

  const handleFieldChange = (
    field: keyof SettingsAiAgentFormValues,
    value: SettingsAiAgentFormValues[keyof SettingsAiAgentFormValues],
  ) => {
    setFormValues((previousValues) => ({ ...previousValues, [field]: value }));
  };

  return {
    formValues,
    handleFieldChange,
    validateForm,
  };
};
