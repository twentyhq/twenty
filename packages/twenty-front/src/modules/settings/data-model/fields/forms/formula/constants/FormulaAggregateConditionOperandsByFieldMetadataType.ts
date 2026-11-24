import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

export const FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE: Partial<
  Record<FieldMetadataType, ViewFilterOperand[]>
> = {
  [FieldMetadataType.SELECT]: [
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_NOT,
    ViewFilterOperand.IS_EMPTY,
    ViewFilterOperand.IS_NOT_EMPTY,
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ViewFilterOperand.IS_EMPTY,
    ViewFilterOperand.IS_NOT_EMPTY,
  ],
  [FieldMetadataType.BOOLEAN]: [ViewFilterOperand.IS],
  [FieldMetadataType.NUMBER]: [
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_NOT,
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
    ViewFilterOperand.IS_EMPTY,
    ViewFilterOperand.IS_NOT_EMPTY,
  ],
  [FieldMetadataType.TEXT]: [
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_NOT,
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ViewFilterOperand.IS_EMPTY,
    ViewFilterOperand.IS_NOT_EMPTY,
  ],
};
