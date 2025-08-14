import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectPermission } from '~/generated/graphql';

type IsObjectReadOnlyParams = {
  objectPermissions: ObjectPermission;
  objectMetadataItem: ObjectMetadataItem;
};

export const isObjectReadOnly = ({
  objectPermissions,
  objectMetadataItem,
}: IsObjectReadOnlyParams) => {
  return (
    !objectPermissions.canUpdateObjectRecords ||
    (objectMetadataItem?.isUIReadOnly ?? false)
  );
};
