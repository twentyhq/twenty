import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { type ConfigVariableValue } from 'twenty-shared/types';
import { z } from 'zod';

import { type ConfigVariable } from '~/generated-metadata/graphql';

type FormValues = {
  value: ConfigVariableValue;
};

const hasMeaningfulValue = (value: ConfigVariableValue): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
};

export const useConfigVariableForm = (variable?: ConfigVariable) => {
  const validationSchema = z.object({
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.record(z.string(), z.unknown()),
      z.null(),
    ]),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    values: { value: variable?.value ?? null },
  });

  const currentValue = watch('value');
  const isValueValid =
    variable !== undefined &&
    !variable.isEnvOnly &&
    isDirty &&
    hasMeaningfulValue(currentValue);

  return {
    control,
    handleSubmit,
    reset,
    isSubmitting,
    currentValue,
    hasValueChanged: isDirty,
    isValueValid,
  };
};
