import { isNull } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE,
  DEFAULT_RAW_JSON_FIELD_NULL_EQUIVALENT_VALUE,
  DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';

export const hasNullEquivalentFieldValue = (
  value: unknown,
  fieldMetadataType: FieldMetadataType,
) => {
  switch (fieldMetadataType) {
    case FieldMetadataType.TEXT:
      if (isNull(value)) return true;

      return DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE;
    case FieldMetadataType.RAW_JSON:
      return DEFAULT_RAW_JSON_FIELD_NULL_EQUIVALENT_VALUE;
    case FieldMetadataType.ARRAY:
      return DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE;
  }

  return undefined;
};
