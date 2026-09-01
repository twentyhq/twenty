import { isObject, isString } from '@sniptt/guards';

import { type CallRecorderApplicationVariableOption } from 'src/front-components/types/call-recorder-application-variable.type';

const isOption = (
  value: unknown,
): value is CallRecorderApplicationVariableOption =>
  isObject(value) &&
  'label' in value &&
  'value' in value &&
  isString(value.label) &&
  isString(value.value);

export const toApplicationVariableOptions = (
  value: unknown,
): CallRecorderApplicationVariableOption[] =>
  Array.isArray(value)
    ? value.filter(isOption).map(({ label, value: optionValue }) => ({
        label,
        value: optionValue,
      }))
    : [];
