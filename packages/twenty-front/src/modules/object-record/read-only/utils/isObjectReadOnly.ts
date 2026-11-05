import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type IsObjectReadOnlyParams = {
  isLayoutCustomizationModeEnabled: boolean;
  objectPermissions: ObjectRecordsPermissions;
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
