import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ConfigVariableWithTypes } from '../types/ConfigVariableWithTypes';

type FormValues = {
  value: string | number | boolean | string[] | null;
};

export const useConfigVariableForm = (variable?: ConfigVariableWithTypes) => {
  const validationSchema = z.object({
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.null(),
    ]),
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    values: { value: variable?.value ?? '' },
  });

  const currentValue = watch('value');
  const hasValueChanged = currentValue !== variable?.value;
  const isValueValid = !!(
    variable &&
    !variable.isEnvOnly &&
    hasValueChanged &&
    ((typeof currentValue === 'string' && currentValue.trim() !== '') ||
      typeof currentValue === 'boolean' ||
      typeof currentValue === 'number' ||
      (Array.isArray(currentValue) && currentValue.length > 0))
  );

  return {
    handleSubmit,
    setValue,
    isSubmitting,
    watch,
    currentValue,
    hasValueChanged,
    isValueValid,
  };
};
