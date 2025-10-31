import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectPermission } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';

type IsObjectMetadataReadOnlyParams = {
  objectPermissions?: ObjectPermission;
  objectMetadataItem?: Pick<
    ObjectMetadataItem,
    'isUIReadOnly' | 'isRemote' | 'applicationId'
  >;
};

export const isObjectMetadataSettingsReadOnly = ({
  objectPermissions,
  objectMetadataItem,
}: IsObjectMetadataReadOnlyParams) => {
  return (
    isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem }) ||
    isDefined(objectMetadataItem?.applicationId)
  );
};
