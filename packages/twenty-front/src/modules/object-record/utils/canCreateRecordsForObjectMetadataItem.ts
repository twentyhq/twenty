import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermissions } from 'twenty-shared/types';

type CanCreateRecordsForObjectMetadataItemParams = {
  objectPermissions?: Pick<ObjectPermissions, 'canUpdateObjectRecords'>;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUICreatable' | 'isUIEditable' | 'isRemote' | 'writability'
  >;
};

// isSystem only controls Data Model visibility; isUICreatable and OPEN writability govern creation.
// No CREATE permission exists yet, so canUpdateObjectRecords is the proxy (inline creation edits a blank record).
export const canCreateRecordsForObjectMetadataItem = ({
  objectPermissions,
  objectMetadataItem,
}: CanCreateRecordsForObjectMetadataItemParams): boolean => {
  return (
    objectMetadataItem.isUICreatable &&
    !isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem })
  );
};
