import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';

type IsObjectReadOnlyParams = {
  isLayoutCustomizationModeEnabled: boolean;
  objectPermissions: Pick<
    ObjectRecordsPermissionsWithObjectMetadataId,
    'canUpdateSomeRecords'
  >;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUIEditable' | 'isRemote'
  >;
};

export const isObjectReadOnly = ({
  isLayoutCustomizationModeEnabled,
  objectPermissions,
  objectMetadataItem,
}: IsObjectReadOnlyParams) => {
  return (
    isLayoutCustomizationModeEnabled ||
    isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem })
  );
};
