import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared';

export const hasObjectMetadataItemFieldCreatedBy = (
  objectMetadataItem: ObjectMetadataItem,
) =>
  objectMetadataItem.fields.some(
    (field) =>
      field.type === FieldMetadataType.ACTOR && field.name === 'createdBy',
  );
