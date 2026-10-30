import { FieldMetadataType } from 'twenty-shared/types';

// Scalar fields whose column is the field name and whose value compares by
// equality, so an approved before/after pair can be checked atomically.
export const SETU_AI_RECORD_UPDATE_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.SELECT,
  FieldMetadataType.RATING,
]);
