import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';

type CanCreateRecordsForObjectMetadataItemParams = {
  objectPermissions?: Pick<
    ObjectRecordsPermissionsWithObjectMetadataId,
    'canUpdateSomeRecords'
  >;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUICreatable' | 'isUIEditable' | 'isRemote'
  >;
};

// No CREATE permission exists yet, so canUpdateSomeRecords is the proxy (inline creation edits a blank record).
export const canCreateRecordsForObjectMetadataItem = ({
  objectPermissions,
  objectMetadataItem,
}: CanCreateRecordsForObjectMetadataItemParams): boolean => {
  return (
    objectMetadataItem.isUICreatable &&
    !isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem })
  );
};
