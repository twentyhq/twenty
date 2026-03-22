import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermission } from '~/generated-metadata/graphql';

export type IsObjectReadOnlyParams = {
  objectPermissions: ObjectPermission;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUIReadOnly' | 'isRemote'
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
