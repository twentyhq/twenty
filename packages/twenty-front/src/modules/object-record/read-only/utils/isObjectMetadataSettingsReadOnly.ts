import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
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
  return (
    isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem })
  );
};
