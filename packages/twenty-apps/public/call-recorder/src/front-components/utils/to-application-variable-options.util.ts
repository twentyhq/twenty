import { isString } from '@sniptt/guards';

import { type CallRecorderApplicationVariableOption } from 'src/front-components/types/call-recorder-application-variable.type';

const isOption = (
  value: unknown,
): value is CallRecorderApplicationVariableOption =>
  typeof value === 'object' &&
  value !== null &&
  isString((value as { label?: unknown }).label) &&
  isString((value as { value?: unknown }).value);

export const toApplicationVariableOptions = (
  value: unknown,
): CallRecorderApplicationVariableOption[] =>
  Array.isArray(value)
    ? value.filter(isOption).map(({ label, value: optionValue }) => ({
        label,
        value: optionValue,
      }))
    : [];
