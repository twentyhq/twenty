import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { View } from '@/views/types/View';
import { isDefined } from 'twenty-ui';

type ReturnType = {
  labelPlural: string;
  view: View | null;
};

export const getObjectMetadataLabelPluralFromViewId = (
  views: View[],
  objectMetadataItems: ObjectMetadataItem[],
  viewId: string,
): ReturnType => {
  const view = views.find((view) => view.id === viewId);

  if (!view) {
    return {
      labelPlural: '',
      view: null,
    };
  }

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
