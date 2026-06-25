import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemComputedLink';
import { getObjectNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemComputedLink';
import { getPageLayoutNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/page-layout/utils/getPageLayoutNavigationMenuItemComputedLink';
import { getRecordNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/record/utils/getRecordNavigationMenuItemComputedLink';
import { getViewNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/view/utils/getViewNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemComputedLink = ({
  item,
  objectMetadataItems,
  views,
  lastVisitedViewPerObjectMetadataItem,
}: {
  item: NavigationMenuItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[];
  lastVisitedViewPerObjectMetadataItem?: Record<string, string> | null;
}): string => {
  switch (item.type) {
    case NavigationMenuItemType.OBJECT: {
      const lastVisitedViewId = isDefined(item.targetObjectMetadataId)
        ? lastVisitedViewPerObjectMetadataItem?.[item.targetObjectMetadataId]
        : undefined;

      return getObjectNavigationMenuItemComputedLink(
        item,
        objectMetadataItems,
        views,
        lastVisitedViewId,
      );
    }
    case NavigationMenuItemType.VIEW:
      return getViewNavigationMenuItemComputedLink(
        item,
        objectMetadataItems,
        views,
      );
    case NavigationMenuItemType.LINK:
      return getLinkNavigationMenuItemComputedLink(item);
    case NavigationMenuItemType.RECORD:
      return getRecordNavigationMenuItemComputedLink(item, objectMetadataItems);
    case NavigationMenuItemType.PAGE_LAYOUT:
      return getPageLayoutNavigationMenuItemComputedLink(item);
    default:
      return '';
  }
};
