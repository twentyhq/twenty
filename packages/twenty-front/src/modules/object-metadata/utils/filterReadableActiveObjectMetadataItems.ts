import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const filterReadableActiveObjectMetadataItems = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectRecordsPermissionsWithObjectMetadataId
  >,
): EnrichedObjectMetadataItem[] =>
  objectMetadataItems.filter((objectMetadataItem) => {
    if (!objectMetadataItem.isActive) {
      return false;
    }

    const objectPermissions =
      objectPermissionsByObjectMetadataId[objectMetadataItem.id];

    if (!isDefined(objectPermissions)) {
      return true;
    }

    return objectPermissions.canReadSomeRecords;
  });
