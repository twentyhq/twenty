import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isObjectMetadataAvailableForRelation = (
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'isSystem' | 'nameSingular' | 'isRemote'
  >,
) => {
  return (
    (!objectMetadataItem.isSystem ||
      objectMetadataItem.nameSingular ===
        CoreObjectNameSingular.WorkspaceMember) &&
    !objectMetadataItem.isRemote
  );
};
