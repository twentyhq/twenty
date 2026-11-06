import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

export const filterReadableActiveObjectMetadataItems = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>,
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

    return canReachSomeRecords({
      objectRecordsPermissions: objectPermissions,
      operationType: 'read',
    });
  });
