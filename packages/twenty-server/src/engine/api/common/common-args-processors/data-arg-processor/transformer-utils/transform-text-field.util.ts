import { isNullEquivalentTextFieldValue } from 'src/engine/record-filter/utils/is-null-equivalent-text-field-value.util';

export const transformTextField = (value: string | null): string | null => {
  return isNullEquivalentTextFieldValue(value) ? null : value;
};
