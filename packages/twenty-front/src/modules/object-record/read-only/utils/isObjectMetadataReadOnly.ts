import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isMetadataWritabilityRestricted } from '@/object-record/read-only/utils/internal/isMetadataWritabilityRestricted';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

type IsObjectMetadataReadOnlyParams = {
  objectPermissions?: ObjectPermission;
  objectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'isUIEditable' | 'isRemote' | 'writability'
  >;
};

export const isObjectMetadataReadOnly = ({
  objectPermissions,
  objectMetadataItem,
}: IsObjectMetadataReadOnlyParams) => {
  return (
    (isDefined(objectPermissions) &&
      !objectPermissions.canUpdateObjectRecords) ||
    (isDefined(objectMetadataItem) &&
      (!objectMetadataItem.isUIEditable ||
        objectMetadataItem.isRemote ||
        isMetadataWritabilityRestricted(objectMetadataItem.writability)))
  );
};
