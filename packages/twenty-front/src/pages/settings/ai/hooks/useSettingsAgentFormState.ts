import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type z } from 'zod';
import { settingsAIAgentFormSchema } from '~/pages/settings/ai/validation-schemas/settingsAIAgentFormSchema';

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
    role: null,
    prompt: '',
    isCustom: true,
    modelConfiguration: {},
    responseFormat: {
      type: 'text',
      schema: {
        type: 'object' as const,
        properties: {},
        required: [],
        additionalProperties: false as const,
      },
    },
    evaluationInputs: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    try {
      settingsAIAgentFormSchema.parse(formValues);
      return true;
    } catch {
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
        modelConfiguration: {},
        responseFormat: {
          type: 'text',
          schema: {
            type: 'object' as const,
            properties: {},
            required: [],
            additionalProperties: false as const,
          },
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
