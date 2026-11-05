import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type IsObjectMetadataReadOnlyParams = {
  objectPermissions?: ObjectRecordsPermissions;
  objectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'isUIEditable' | 'isRemote'
  >;
};

export const isObjectMetadataReadOnly = ({
  objectPermissions,
  objectMetadataItem,
}: IsObjectMetadataReadOnlyParams) => {
  return (
    (isDefined(objectPermissions) &&
      !canReachSomeRecords({
        objectRecordsPermissions: objectPermissions,
        operationType: 'update',
      })) ||
    (isDefined(objectMetadataItem) &&
      (!objectMetadataItem.isUIEditable || objectMetadataItem.isRemote))
  );
};
