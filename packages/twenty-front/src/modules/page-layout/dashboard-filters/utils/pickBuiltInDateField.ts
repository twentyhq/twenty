import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

const BUILT_IN_DATE_FIELD_NAME = 'createdAt';

export const pickBuiltInDateField = (fields: FieldMetadataItem[]) =>
  fields.find(
    (field) =>
      field.name === BUILT_IN_DATE_FIELD_NAME &&
      field.type === FieldMetadataType.DATE_TIME &&
      field.isActive,
  );
