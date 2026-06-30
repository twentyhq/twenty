import { isString } from '@sniptt/guards';
import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';

export const transformArrayField = (
  value: string | string[] | null,
): string[] | null => {
  if (isString(value)) return [value];

  return isNullEquivalentArrayFieldValue(value) ? null : value;
};
