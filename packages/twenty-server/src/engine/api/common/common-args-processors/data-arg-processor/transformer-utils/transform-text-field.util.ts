import { isNullEquivalentTextFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-text-field-value.util';

export const transformTextField = (
  value: string | null,
  isNullEquivalenceEnabled: boolean = false,
): string | null => {
  return isNullEquivalenceEnabled && isNullEquivalentTextFieldValue(value)
    ? null
    : value;
};
