import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermissions } from 'twenty-shared/types';

type IsObjectReadOnlyParams = {
  isLayoutCustomizationModeEnabled: boolean;
  objectPermissions: Pick<ObjectPermissions, 'canUpdateObjectRecords'>;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUIEditable' | 'isRemote' | 'writability'
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
