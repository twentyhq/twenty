import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectPermission } from '~/generated/graphql';

type IsObjectMetadataReadOnlyParams = {
  objectPermissions: ObjectPermission;
  objectMetadataItem: Pick<ObjectMetadataItem, 'isUIReadOnly' | 'isRemote'>;
};

export const isObjectMetadataReadOnly = ({
  objectPermissions,
  objectMetadataItem,
}: IsObjectMetadataReadOnlyParams) => {
  return (
    !objectPermissions.canUpdateObjectRecords ||
    objectMetadataItem.isUIReadOnly ||
    objectMetadataItem.isRemote
  );
};
