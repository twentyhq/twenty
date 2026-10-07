import { type AppPreferenceVariable } from '@/settings/app-preferences/types/AppPreferenceVariable';
import { getAppPreferenceVariableOptions } from '@/settings/app-preferences/utils/getAppPreferenceVariableOptions';
import { FieldMetadataType } from 'twenty-shared/types';

export type AppPreferenceVariableError =
  | 'REQUIRED'
  | 'INVALID_NUMBER'
  | 'INVALID_BOOLEAN'
  | 'INVALID_OPTION';

export const getAppPreferenceVariableError = ({
  variable,
  value,
}: {
  variable: Pick<
    AppPreferenceVariable,
    'type' | 'isRequired' | 'options' | 'isSecret' | 'value' | 'isDeprecated'
  >;
  value: string;
}): AppPreferenceVariableError | undefined => {
  // An unchanged masked secret is already stored; its plaintext cannot be
  // validated in the browser or included in another preference's update.
  if (variable.isSecret && variable.value !== '' && value === variable.value) {
    return undefined;
  }

  if (variable.isDeprecated && value === variable.value) {
    return undefined;
  }

  if (value.trim() === '') {
    return variable.isRequired ? 'REQUIRED' : undefined;
  }

  switch (variable.type) {
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return Number.isFinite(Number(value)) ? undefined : 'INVALID_NUMBER';
    case FieldMetadataType.BOOLEAN:
      return value === 'true' || value === 'false'
        ? undefined
        : 'INVALID_BOOLEAN';
    case FieldMetadataType.SELECT:
      return getAppPreferenceVariableOptions(variable.options).some(
        (option) => option.value === value,
      )
        ? undefined
        : 'INVALID_OPTION';
    default:
      return undefined;
  }
};
