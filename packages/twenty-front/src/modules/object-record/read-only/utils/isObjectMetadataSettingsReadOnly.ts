import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectPermission } from '~/generated/graphql';

type IsObjectMetadataReadOnlyParams = {
  objectPermissions?: ObjectPermission;
  objectMetadataItem?: Pick<
    ObjectMetadataItem,
    'isUIReadOnly' | 'isRemote' | 'applicationId'
  >;
  workspaceCustomApplicationId: string | null;
};

export const isObjectMetadataSettingsReadOnly = ({
  objectPermissions,
  objectMetadataItem,
  workspaceCustomApplicationId,
}: IsObjectMetadataReadOnlyParams) => {
  // Note: we intentionally don't check isUIReadOnly here because that flag
  // controls record-level editing, not whether custom fields can be added.
  // Remote objects cannot have custom fields added.
  return (
    (isDefined(objectPermissions) &&
      !objectPermissions.canUpdateObjectRecords) ||
    objectMetadataItem?.isRemote === true ||
    (isDefined(objectMetadataItem?.applicationId)
      ? isDefined(workspaceCustomApplicationId)
        ? objectMetadataItem.applicationId !== workspaceCustomApplicationId
        : true
      : false)
  );
};
