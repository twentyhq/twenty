import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermission } from '~/generated/graphql';

type IsObjectMetadataSettingsReadOnlyParams = {
  objectPermissions?: ObjectPermission;
  objectMetadataItem?: Pick<ObjectMetadataItem, 'isUIReadOnly' | 'isRemote'>;
};

// Returns true only for remote or UI read-only objects
// Standard and third-party app objects are editable (label/icon/description via standardOverrides)
export const isObjectMetadataSettingsReadOnly = ({
  objectPermissions,
  objectMetadataItem,
}: IsObjectMetadataSettingsReadOnlyParams) => {
  return isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem });
};
