import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

type ReturnType = {
  namePlural: string;
  view: Pick<View, 'id' | 'name' | 'objectMetadataId'>;
};

export const getObjectMetadataNamePluralFromViewId = (
  view: Pick<View, 'id' | 'name' | 'objectMetadataId'>,
  objectMetadataItems: ObjectMetadataItem[],
): ReturnType => {
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === view.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item not found for id ${view.objectMetadataId}`,
    );
  }

  const { namePlural } = objectMetadataItem;

  return {
    namePlural,
    view,
  };
};
