import { useCallback, useState } from 'react';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
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
    icon: 'IconLego',
    modelId: mode === 'edit' ? '' : AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
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

  const handleFieldChange = useCallback(
    (
      field: keyof SettingsAiAgentFormValues,
      value: SettingsAiAgentFormValues[keyof SettingsAiAgentFormValues],
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Stable so the effect that loads an agent into the form can list it as a
  // dependency without re-running, and re-setting state, on every render.
  const resetForm = useCallback(
    (values?: Partial<SettingsAiAgentFormValues>) => {
      if (isDefined(values)) {
        setFormValues((prev) => ({ ...prev, ...values }));
      } else {
        setFormValues({
          name: '',
          label: '',
          description: '',
          icon: 'IconLego',
          modelId:
            mode === 'edit' ? '' : AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
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
    },
    [mode],
  );

  return {
    formValues,
    isSubmitting,
    handleFieldChange,
    resetForm,
    setIsSubmitting,
    validateForm,
  };
};
