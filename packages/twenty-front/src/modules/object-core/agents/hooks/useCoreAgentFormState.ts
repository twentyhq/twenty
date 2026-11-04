import { useState } from 'react';
import { reconcileCoreAgentFormValues } from '@/object-core/agents/utils/reconcileCoreAgentFormValues';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import {
  coreAgentFormSchema,
  type CoreAgentFormValues,
} from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

export const useCoreAgentFormState = (initialValues: CoreAgentFormValues) => {
  const [formState, setFormState] = useState({
    serverValues: initialValues,
    formValues: initialValues,
  });
  const hasServerValueChanges = !isDeeplyEqual(
    formState.serverValues,
    initialValues,
  );
  const formValues = hasServerValueChanges
    ? reconcileCoreAgentFormValues({
        previousValues: formState.serverValues,
        localValues: formState.formValues,
        serverValues: initialValues,
      })
    : formState.formValues;

  if (hasServerValueChanges) {
    setFormState({ serverValues: initialValues, formValues });
  }

  const validateForm = (): boolean =>
    coreAgentFormSchema.safeParse(formValues).success;

  const setFieldValue = ({
    field,
    value,
  }: {
    field: keyof CoreAgentFormValues;
    value: CoreAgentFormValues[keyof CoreAgentFormValues];
  }) => {
    setFormState((previousState) => ({
      ...previousState,
      formValues: { ...previousState.formValues, [field]: value },
    }));
  };

  return {
    formValues,
    setFieldValue,
    validateForm,
  };
};
