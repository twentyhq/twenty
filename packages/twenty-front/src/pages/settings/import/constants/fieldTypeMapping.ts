import { FieldMetadataType } from 'twenty-shared/types';

export const FIELD_TYPE_MAPPING: Record<string, FieldMetadataType> = {
  TEXT: FieldMetadataType.TEXT,
  EMAIL: FieldMetadataType.EMAILS,
  PHONE: FieldMetadataType.PHONES,
  NUMBER: FieldMetadataType.NUMBER,
  BOOLEAN: FieldMetadataType.BOOLEAN,
  DATE_TIME: FieldMetadataType.DATE_TIME,
  DATE: FieldMetadataType.DATE,
  CURRENCY: FieldMetadataType.CURRENCY,
  FULL_NAME: FieldMetadataType.FULL_NAME,
  ADDRESS: FieldMetadataType.ADDRESS,
  LINKS: FieldMetadataType.LINKS,
  SELECT: FieldMetadataType.SELECT,
  MULTI_SELECT: FieldMetadataType.MULTI_SELECT,
  RICH_TEXT: FieldMetadataType.RICH_TEXT,
  RAW_JSON: FieldMetadataType.RAW_JSON,
  ARRAY: FieldMetadataType.ARRAY,
  RATING: FieldMetadataType.RATING,
};
