import { useState } from 'react';
import {
  coreAgentFormSchema,
  type CoreAgentFormValues,
} from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

export const useCoreAgentFormState = (initialValues: CoreAgentFormValues) => {
  const [formValues, setFormValues] =
    useState<CoreAgentFormValues>(initialValues);
  const validateForm = (): boolean =>
    coreAgentFormSchema.safeParse(formValues).success;

  const setFieldValue = (
    field: keyof CoreAgentFormValues,
    value: CoreAgentFormValues[keyof CoreAgentFormValues],
  ) => {
    setFormValues((previousValues) => ({ ...previousValues, [field]: value }));
  };

  return {
    formValues,
    setFieldValue,
    validateForm,
  };
};
