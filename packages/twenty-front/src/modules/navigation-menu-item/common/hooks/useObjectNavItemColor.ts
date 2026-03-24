import { getObjectColorForNavigationMenuItem } from '@/navigation-menu-item/common/utils/getObjectColorForNavigationMenuItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

export const useObjectNavItemColor = (objectNameSingular: string): string => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  if (!objectMetadataItem) {
    return 'gray';
  }

  return getObjectColorForNavigationMenuItem(objectMetadataItem);
};
