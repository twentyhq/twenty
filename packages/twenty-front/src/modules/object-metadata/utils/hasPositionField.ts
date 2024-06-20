import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const hasPositionField = (objectMetadataItem: ObjectMetadataItem) =>
  !objectMetadataItem.isRemote;
