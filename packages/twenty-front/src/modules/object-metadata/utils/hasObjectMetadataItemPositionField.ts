import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const hasObjectMetadataItemPositionField = (
  objectMetadataItem: ObjectMetadataItem,
) =>
  !objectMetadataItem.isRemote &&
  objectMetadataItem.fields.some((field) => field.name === 'position');
