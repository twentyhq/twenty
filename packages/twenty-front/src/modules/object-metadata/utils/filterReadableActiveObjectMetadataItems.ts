import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const filterReadableActiveObjectMetadataItems = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >,
): EnrichedObjectMetadataItem[] =>
  objectMetadataItems.filter((objectMetadataItem) => {
    const objectPermissions =
      objectPermissionsByObjectMetadataId[objectMetadataItem.id];

    return (
      isDefined(objectPermissions) &&
      objectPermissions.canReadObjectRecords &&
      objectMetadataItem.isActive
    );
  });
