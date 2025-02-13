import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared';

export const checkObjectMetadataItemHasFieldCreatedBy = (
  objectMetadataItem: ObjectMetadataItem,
) =>
  objectMetadataItem.fields.some(
    (field) =>
      field.type === FieldMetadataType.ACTOR && field.name === 'createdBy',
  );
