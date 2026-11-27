import { type FieldMetadataType } from 'twenty-shared/types';

export type ConditionalAvailabilityFilterFieldType =
  | FieldMetadataType.SELECT
  | FieldMetadataType.RELATION
  | FieldMetadataType.TEXT
  | FieldMetadataType.NUMBER
  | FieldMetadataType.NUMERIC
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.BOOLEAN
  | FieldMetadataType.DATE
  | FieldMetadataType.DATE_TIME;
