import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type GetConflictingObjectMetadataItemParams = {
  objectMetadataItems: ObjectMetadataItem[];
  nameSingular?: string;
  namePlural?: string;
  excludeObjectId?: string;
};

export const getConflictingObjectMetadataItem = ({
  objectMetadataItems,
  nameSingular,
  namePlural,
  excludeObjectId,
}: GetConflictingObjectMetadataItemParams): ObjectMetadataItem | undefined => {
  if (!isDefined(nameSingular) && !isDefined(namePlural)) {
    return undefined;
  }

  return objectMetadataItems.find((objectMetadataItem) => {
    if (
      isDefined(excludeObjectId) &&
      objectMetadataItem.id === excludeObjectId
    ) {
      return false;
    }

    const hasSingularConflict =
      isDefined(nameSingular) &&
      nameSingular === objectMetadataItem.nameSingular;
    const hasPluralConflict =
      isDefined(namePlural) && namePlural === objectMetadataItem.namePlural;

    return hasSingularConflict || hasPluralConflict;
  });
};
