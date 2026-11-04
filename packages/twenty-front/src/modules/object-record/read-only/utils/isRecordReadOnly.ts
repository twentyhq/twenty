import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';

export type IsObjectReadOnlyParams = {
  objectPermissions: Pick<
    ObjectRecordsPermissionsWithObjectMetadataId,
    'canUpdateSomeRecords'
  >;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUIEditable' | 'isRemote'
  >;
  isRecordDeleted: boolean;
};

export const isRecordReadOnly = ({
  objectPermissions,
  isRecordDeleted,
  objectMetadataItem,
}: IsObjectReadOnlyParams) => {
  return (
    isRecordDeleted ||
    isObjectMetadataReadOnly({
      objectPermissions,
      objectMetadataItem,
    })
  );
};
