import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { settingsAIAgentFormSchema } from '../validation-schemas/settingsAIAgentFormSchema';

export type SettingsAIAgentFormValues = z.infer<
  typeof settingsAIAgentFormSchema
>;

export const useSettingsAgentFormState = (mode: 'create' | 'edit') => {
  const [formValues, setFormValues] = useState<SettingsAIAgentFormValues>({
    name: '',
    label: '',
    description: '',
    icon: 'IconRobot',
    modelId: mode === 'edit' ? '' : 'auto',
    role: '',
    prompt: '',
    isCustom: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    try {
      settingsAIAgentFormSchema.parse(formValues);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleFieldChange = (
    field: keyof SettingsAIAgentFormValues,
    value: SettingsAIAgentFormValues[keyof SettingsAIAgentFormValues],
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = (values?: Partial<SettingsAIAgentFormValues>) => {
    if (isDefined(values)) {
      setFormValues((prev) => ({ ...prev, ...values }));
    } else {
      setFormValues({
        name: '',
        label: '',
        description: '',
        icon: 'IconRobot',
        modelId: mode === 'edit' ? '' : 'auto',
        role: '',
        prompt: '',
        isCustom: true,
      });
    }
  };

  return {
    formValues,
    isSubmitting,
    handleFieldChange,
    resetForm,
    setIsSubmitting,
    validateForm,
  };
};
