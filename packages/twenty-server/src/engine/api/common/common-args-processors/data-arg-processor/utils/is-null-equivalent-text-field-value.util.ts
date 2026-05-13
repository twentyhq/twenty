import { isNull, isString } from '@sniptt/guards';

import { DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE } from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';

export const isNullEquivalentTextFieldValue = (value: unknown): boolean => {
  if (isNull(value)) return true;

  return isString(value) && value === DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE;
};
