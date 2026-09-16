import { getObjectNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemComputedLink';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { OBJECT_BACKED_NAVIGATION_MENU_ITEM_TYPES } from '@/navigation-menu-item/common/constants/ObjectBackedNavigationMenuItemTypes';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getObjectDrawerItemNavigationPath = ({
  navigationMenuItem,
  objectMetadataItem,
  objectMetadataItems,
  views,
  lastVisitedViewPerObjectMetadataItem,
  isInitialObjectViewEnabled = false,
}: {
  navigationMenuItem?: NavigationMenuItem;
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id' | 'namePlural'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key' | 'type' | 'position'>[];
  lastVisitedViewPerObjectMetadataItem: Record<string, string> | null;
  isInitialObjectViewEnabled?: boolean;
}): string => {
  const hasNavigationMenuItem =
    isDefined(navigationMenuItem) &&
    OBJECT_BACKED_NAVIGATION_MENU_ITEM_TYPES.includes(navigationMenuItem.type);

  if (hasNavigationMenuItem) {
    return getNavigationMenuItemComputedLink({
      item: navigationMenuItem,
      objectMetadataItems,
      views,
      lastVisitedViewPerObjectMetadataItem,
      isInitialObjectViewEnabled,
    });
  }

  return getObjectNavigationMenuItemComputedLink({
    item: { targetObjectMetadataId: objectMetadataItem.id },
    objectMetadataItems,
    views,
    lastVisitedViewId:
      lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem.id],
    isInitialObjectViewEnabled,
  });
};
