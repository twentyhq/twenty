import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { View } from '@/views/types/View';
import { isDefined } from 'twenty-shared';

type ReturnType = {
  labelPlural: string;
  view: Pick<View, 'id' | 'name' | 'objectMetadataId'>;
};

export const getObjectMetadataLabelPluralFromViewId = (
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

  const { labelPlural } = objectMetadataItem;

  return {
    labelPlural,
    view,
  };
};
