import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { type ActiveNavigationMenuItem } from '@/navigation-menu-item/common/types/ActiveNavigationMenuItem';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';

type IsNavigationMenuItemActiveParams = {
  navigationMenuItem: NavigationMenuItem | null;
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentPath: string;
  currentPathWithSearch: string;
  activeNavigationMenuItem: ActiveNavigationMenuItem | null;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: View[];
};

export const isNavigationMenuItemActive = ({
  navigationMenuItem,
  objectMetadataItem,
  currentPath,
  currentPathWithSearch,
  activeNavigationMenuItem,
  objectMetadataItems,
  views,
}: IsNavigationMenuItemActiveParams) => {
  const isRecord = navigationMenuItem?.type === NavigationMenuItemType.RECORD;
  const isObject = navigationMenuItem?.type === NavigationMenuItemType.OBJECT;
  const hasNavigationMenuItem = isDefined(navigationMenuItem);

  const computedLink = hasNavigationMenuItem
    ? getNavigationMenuItemComputedLink(
        navigationMenuItem,
        objectMetadataItems,
        views,
      )
    : '';

  const isOnRecordShowPage = currentPath.includes(
    getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: objectMetadataItem.nameSingular,
      objectRecordId: '',
    }) + '/',
  );

  const urlMatches = hasNavigationMenuItem
    ? isLocationMatchingNavigationMenuItem(
        currentPath,
        currentPathWithSearch,
        navigationMenuItem.type,
        computedLink,
      )
    : currentPath ===
        getAppPath(AppPath.RecordIndexPage, {
          objectNamePlural: objectMetadataItem.namePlural,
        }) || isOnRecordShowPage;

  const isActiveItemForCurrentPage =
    isDefined(activeNavigationMenuItem) &&
    currentPathWithSearch === activeNavigationMenuItem.path;

  const isActiveItemForCurrentObject =
    isDefined(activeNavigationMenuItem) &&
    isOnRecordShowPage &&
    activeNavigationMenuItem.objectMetadataId === objectMetadataItem.id;

  const hasRelevantActiveItem =
    isActiveItemForCurrentPage || isActiveItemForCurrentObject;

  if (isOnRecordShowPage) {
    if (isRecord && urlMatches) {
      return true;
    }
    if (
      hasRelevantActiveItem &&
      activeNavigationMenuItem?.id === navigationMenuItem?.id
    ) {
      return true;
    }
    if (isObject && !hasRelevantActiveItem) {
      return true;
    }
    if (!hasNavigationMenuItem) {
      return !hasRelevantActiveItem;
    }
    return false;
  }

  return (
    urlMatches &&
    (!isActiveItemForCurrentPage ||
      activeNavigationMenuItem?.id === navigationMenuItem?.id)
  );
};
