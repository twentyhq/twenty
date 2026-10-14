import { FieldMetadataType } from 'twenty-shared/types';

export const RECORD_TABLE_LEAN_CELL_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.ADDRESS,
  FieldMetadataType.ARRAY,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.LINKS,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.PHONES,
  FieldMetadataType.RATING,
  FieldMetadataType.SELECT,
  FieldMetadataType.UUID,
]);
