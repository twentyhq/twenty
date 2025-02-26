import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const hasObjectMetadataItemPositionField = (
  objectMetadataItem: ObjectMetadataItem,
) => objectMetadataItem.fields.some((field) => field.name === 'position');
