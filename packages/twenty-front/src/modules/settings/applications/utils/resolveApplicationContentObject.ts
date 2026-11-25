import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ResolvedApplicationContentObject } from '@/settings/applications/types/ResolvedApplicationContentObject';

export const resolveApplicationContentObject = ({
  objectUniversalIdentifier,
  objectMetadataItems,
  contentObjects,
}: {
  objectUniversalIdentifier: string | null | undefined;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  contentObjects: Pick<
    ApplicationContentItem,
    'universalIdentifier' | 'label' | 'icon' | 'color'
  >[];
}): ResolvedApplicationContentObject | undefined => {
  if (!isDefined(objectUniversalIdentifier)) {
    return undefined;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (object) => object.universalIdentifier === objectUniversalIdentifier,
  );

  if (isDefined(objectMetadataItem)) {
    return {
      universalIdentifier: objectUniversalIdentifier,
      label: objectMetadataItem.labelPlural,
      labelSingular: objectMetadataItem.labelSingular,
      icon: objectMetadataItem.icon,
      color: getObjectColorWithFallback(objectMetadataItem),
      colorSource: objectMetadataItem,
    };
  }

  // Objects of a marketplace app that is not installed only exist in its content
  const contentObject = contentObjects.find(
    (object) => object.universalIdentifier === objectUniversalIdentifier,
  );

  if (!isDefined(contentObject)) {
    return undefined;
  }

  const colorSource = {
    color: contentObject.color,
    isSystem: false,
    nameSingular: '',
  };

  return {
    universalIdentifier: objectUniversalIdentifier,
    label: contentObject.label,
    icon: contentObject.icon,
    color: getObjectColorWithFallback(colorSource),
    colorSource,
  };
};
