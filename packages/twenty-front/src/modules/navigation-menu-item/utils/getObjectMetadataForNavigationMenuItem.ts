import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

type NavigationMenuItemWithItemType = Pick<
  ProcessedNavigationMenuItem,
  'itemType' | 'viewId' | 'targetObjectMetadataId'
>;

export const getObjectMetadataForNavigationMenuItem = (
  navigationMenuItem: NavigationMenuItemWithItemType,
  objectMetadataItems: ObjectMetadataItem[],
  views: View[],
): ObjectMetadataItem | null => {
  if (navigationMenuItem.itemType === NavigationMenuItemType.LINK) {
    return null;
  }

  if (
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW &&
    isDefined(navigationMenuItem.viewId)
  ) {
    const view = views.find((view) => view.id === navigationMenuItem.viewId);
    if (!isDefined(view)) {
      return null;
    }
    const objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === view.objectMetadataId,
    );
    return objectMetadataItem ?? null;
  }

  if (
    navigationMenuItem.itemType === NavigationMenuItemType.RECORD &&
    isDefined(navigationMenuItem.targetObjectMetadataId)
  ) {
    const objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === navigationMenuItem.targetObjectMetadataId,
    );
    return objectMetadataItem ?? null;
  }

  return null;
};
