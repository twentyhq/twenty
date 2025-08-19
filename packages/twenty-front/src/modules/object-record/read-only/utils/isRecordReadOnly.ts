import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermission } from '~/generated/graphql';

export type IsObjectReadOnlyParams = {
  objectPermissions: ObjectPermission;
  objectMetadataItem: Pick<ObjectMetadataItem, 'isUIReadOnly' | 'isRemote'>;
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
