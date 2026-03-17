import { isNonEmptyString } from '@sniptt/guards';

import { getStandardObjectIconColor } from '@/navigation-menu-item/common/utils/getStandardObjectIconColor';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

export const useObjectNavItemColor = (objectNameSingular: string): string => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  const storedColor = objectMetadataItem?.color;
  const fallbackColor = getStandardObjectIconColor(objectNameSingular);

  if (isNonEmptyString(storedColor)) {
    return storedColor;
  }

  return fallbackColor;
};
