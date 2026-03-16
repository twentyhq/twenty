import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  ARRAY_FILTER_OPERATORS,
  BOOLEAN_FILTER_OPERATORS,
  DATE_FILTER_OPERATORS,
  ENUM_FILTER_OPERATORS,
  MULTI_SELECT_FILTER_OPERATORS,
  NUMBER_FILTER_OPERATORS,
  RAW_JSON_FILTER_OPERATORS,
  RICH_TEXT_FILTER_OPERATORS,
  STRING_FILTER_OPERATORS,
  UUID_FILTER_OPERATORS,
} from 'src/engine/api/common/common-args-processors/filter-arg-processor/constants/filter-operators.constant';
import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';

export const getOperatorsForFieldType = (
  fieldType: FieldMetadataType,
): FilterOperator[] => {
  switch (fieldType) {
    case FieldMetadataType.TEXT:
      return STRING_FILTER_OPERATORS;

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return NUMBER_FILTER_OPERATORS;

    case FieldMetadataType.BOOLEAN:
      return BOOLEAN_FILTER_OPERATORS;

    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      return DATE_FILTER_OPERATORS;

    case FieldMetadataType.UUID:
    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION:
      return UUID_FILTER_OPERATORS;

    case FieldMetadataType.ARRAY:
      return ARRAY_FILTER_OPERATORS;

    case FieldMetadataType.MULTI_SELECT:
      return MULTI_SELECT_FILTER_OPERATORS;

    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return ENUM_FILTER_OPERATORS;

    case FieldMetadataType.RAW_JSON:
    case FieldMetadataType.FILES:
      return RAW_JSON_FILTER_OPERATORS;

    case FieldMetadataType.RICH_TEXT:
      return RICH_TEXT_FILTER_OPERATORS;

    case FieldMetadataType.TS_VECTOR:
    case FieldMetadataType.ACTOR:
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.CURRENCY:
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.FULL_NAME:
    case FieldMetadataType.LINKS:
    case FieldMetadataType.PHONES:
      return ['eq', 'neq', 'is'];

    default:
      assertUnreachable(fieldType);
  }
};
