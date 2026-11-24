import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

export const ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE: Partial<
  Record<FieldMetadataType, ViewFilterOperand[]>
> = {
  [FieldMetadataType.SELECT]: [ViewFilterOperand.IS, ViewFilterOperand.IS_NOT],
  [FieldMetadataType.MULTI_SELECT]: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
  ],
  [FieldMetadataType.BOOLEAN]: [ViewFilterOperand.IS],
  [FieldMetadataType.NUMBER]: [
    ViewFilterOperand.IS,
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
  ],
  [FieldMetadataType.TEXT]: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
  ],
};
