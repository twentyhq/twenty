import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermissions } from 'twenty-shared/types';

export type IsObjectReadOnlyParams = {
  objectPermissions: Pick<ObjectPermissions, 'canUpdateObjectRecords'>;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUIEditable' | 'isRemote' | 'writability'
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
