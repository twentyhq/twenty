import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

export const isTriggerableField = (field: FieldMetadataItem): boolean =>
  field.isActive === true &&
  field.isSystem !== true &&
  field.type !== FieldMetadataType.RELATION &&
  field.type !== FieldMetadataType.MORPH_RELATION &&
  field.type !== FieldMetadataType.TS_VECTOR &&
  field.type !== FieldMetadataType.POSITION;
