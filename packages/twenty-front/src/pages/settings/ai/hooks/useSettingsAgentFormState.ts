import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type z } from 'zod';
import { settingsAiAgentFormSchema } from '~/pages/settings/ai/validation-schemas/settingsAiAgentFormSchema';

export type SettingsAiAgentFormValues = z.infer<
  typeof settingsAiAgentFormSchema
>;

export const useSettingsAgentFormState = (mode: 'create' | 'edit') => {
  const [formValues, setFormValues] = useState<SettingsAiAgentFormValues>({
    name: '',
    label: '',
    description: '',
    icon: 'IconRobot',
    modelId: mode === 'edit' ? '' : 'auto',
    role: null,
    prompt: '',
    isCustom: true,
    modelConfiguration: {},
    responseFormat: {
      // TODO: Keep text default until legacy text agents are migrated in production.
      type: 'text',
    },
    evaluationInputs: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    try {
      settingsAiAgentFormSchema.parse(formValues);
      return true;
    } catch {
      return false;
    }
  };

  const handleFieldChange = (
    field: keyof SettingsAiAgentFormValues,
    value: SettingsAiAgentFormValues[keyof SettingsAiAgentFormValues],
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = (values?: Partial<SettingsAiAgentFormValues>) => {
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
        modelConfiguration: {},
        responseFormat: {
          // TODO: Keep text default until legacy text agents are migrated in production.
          type: 'text',
        },
        evaluationInputs: [],
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
