import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isWorkflowSubObject } from '@/object-metadata/utils/isWorkflowSubObject';

export const isReadOnlyObject = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'isRemote' | 'nameSingular'>,
) =>
  objectMetadataItem.isRemote ||
  isWorkflowSubObject(objectMetadataItem.nameSingular);
