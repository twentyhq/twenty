import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isObjectMetadataAvailableForRelation = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'isSystem' | 'nameSingular'>,
) => {
  return (
    !objectMetadataItem.isSystem ||
    objectMetadataItem.nameSingular === CoreObjectNameSingular.WorkspaceMember
  );
};
