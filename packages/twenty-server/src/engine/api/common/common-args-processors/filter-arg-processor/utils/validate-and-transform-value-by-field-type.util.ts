import { FieldMetadataType } from 'twenty-shared/types';
import { parseBooleanFromStringValue } from 'twenty-shared/workflow';

import { validateBooleanFieldOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/validator-utils/validate-boolean-field-or-throw.util';
import { validateDateFieldOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/validator-utils/validate-date-field-or-throw.util';
import { validateDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/validator-utils/validate-date-time-field-or-throw.util';
import { validateNumberFieldOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/validator-utils/validate-number-field-or-throw.util';
import { validateSelectFieldOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/validator-utils/validate-select-field-or-throw.util';
import { validateUUIDFieldOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/validator-utils/validate-uuid-field-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { parseNumberValue } from './parse-number-value.util';

export const validateAndTransformValueByFieldType = (
  value: unknown,
  fieldMetadata: FlatFieldMetadata,
  fieldName: string,
): unknown => {
  const fieldType = fieldMetadata.type;

  switch (fieldType) {
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION: {
      const coercedNumber = parseNumberValue(value, fieldType);

      validateNumberFieldOrThrow(coercedNumber, fieldName);

      return coercedNumber;
    }

    case FieldMetadataType.BOOLEAN: {
      const coercedBoolean =
        typeof value === 'string'
          ? parseBooleanFromStringValue(value.toString())
          : value;

      validateBooleanFieldOrThrow(coercedBoolean, fieldName);

      return coercedBoolean;
    }

    case FieldMetadataType.UUID:
    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION:
      validateUUIDFieldOrThrow(value, fieldName);

      return value;

    case FieldMetadataType.DATE:
      validateDateFieldOrThrow(value, fieldName);

      return value;

    case FieldMetadataType.DATE_TIME:
      validateDateTimeFieldOrThrow(value, fieldName);

      return value;

    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      validateSelectFieldOrThrow(value, fieldMetadata, fieldName);

      return value;

    default:
      return value;
  }
};
