import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type IsObjectMetadataReadOnlyParams = {
  objectPermissions?: Pick<
    ObjectRecordsPermissionsWithObjectMetadataId,
    'canUpdateSomeRecords'
  >;
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
    (isDefined(objectPermissions) && !objectPermissions.canUpdateSomeRecords) ||
    (isDefined(objectMetadataItem) &&
      (!objectMetadataItem.isUIEditable || objectMetadataItem.isRemote))
  );
};
