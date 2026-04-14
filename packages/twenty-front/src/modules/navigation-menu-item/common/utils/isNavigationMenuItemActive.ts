import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { type ActiveNavigationMenuItem } from '@/navigation-menu-item/common/types/ActiveNavigationMenuItem';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type IsNavigationMenuItemActiveParams = {
  navigationMenuItem: NavigationMenuItem | null;
  computedLink: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentPath: string;
  currentPathWithSearch: string;
  activeNavigationMenuItem: ActiveNavigationMenuItem | null;
};

export const isNavigationMenuItemActive = ({
  navigationMenuItem,
  computedLink,
  objectMetadataItem,
  currentPath,
  currentPathWithSearch,
  activeNavigationMenuItem,
}: IsNavigationMenuItemActiveParams) => {
  const isRecord = navigationMenuItem?.type === NavigationMenuItemType.RECORD;
  const isObject = navigationMenuItem?.type === NavigationMenuItemType.OBJECT;
  const hasNavigationMenuItem = isDefined(navigationMenuItem);

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
    return (isObject || !hasNavigationMenuItem) && !hasRelevantActiveItem;
  }

  return (
    urlMatches &&
    (!isActiveItemForCurrentPage ||
      activeNavigationMenuItem?.id === navigationMenuItem?.id)
  );
};
