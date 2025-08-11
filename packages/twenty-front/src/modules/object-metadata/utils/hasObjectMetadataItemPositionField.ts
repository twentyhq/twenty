import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

export const hasObjectMetadataItemPositionField = (
  objectMetadataItem: ObjectMetadataItem,
) =>
  objectMetadataItem.fields.some(
    (field) => field.type === FieldMetadataType.POSITION,
  );
