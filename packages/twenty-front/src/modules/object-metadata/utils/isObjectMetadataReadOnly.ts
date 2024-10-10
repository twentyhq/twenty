import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';

export const isObjectMetadataReadOnly = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'isRemote' | 'nameSingular'>,
) =>
  objectMetadataItem.isRemote ||
  isWorkflowSubObjectMetadata(objectMetadataItem.nameSingular);
