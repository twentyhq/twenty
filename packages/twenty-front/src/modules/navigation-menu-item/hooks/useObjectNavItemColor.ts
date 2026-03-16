import { isNonEmptyString } from '@sniptt/guards';

import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

export const useObjectNavItemColor = (objectNameSingular: string): string => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  if (isNonEmptyString(objectMetadataItem?.color)) {
    return objectMetadataItem.color;
  }

  return getStandardObjectIconColor(objectNameSingular);
};
