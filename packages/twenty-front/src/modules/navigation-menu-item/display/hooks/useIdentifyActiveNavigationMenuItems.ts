import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { lastClickedNavigationMenuItemIdState } from '@/navigation-menu-item/common/states/lastClickedNavigationMenuItemIdState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useIdentifyActiveNavigationMenuItems = (): {
  activeNavigationMenuItemIds: string[];
  objectMetadataIdForOpenedSection: string | null;
} => {
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const lastClickedNavigationMenuItemId = useAtomStateValue(
    lastClickedNavigationMenuItemIdState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const location = useLocation();
  const {
    objectNamePlural: currentObjectNamePlural,
    objectNameSingular: currentObjectNameSingular,
  } = useParams();

  const currentPath = location.pathname;
  const currentPathWithSearch = location.pathname + location.search;

  const currentObjectMetadataItem = activeObjectMetadataItems.find(
    (item) =>
      item.namePlural === currentObjectNamePlural ||
      item.nameSingular === currentObjectNameSingular,
  );

  const isOnRecordShowPage =
    isDefined(currentObjectMetadataItem) &&
    currentPath.includes(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: currentObjectMetadataItem.nameSingular,
        objectRecordId: '',
      }) + '/',
    );

  const { activeNavigationMenuItemIds, objectMetadataIdForOpenedSection } =
    useMemo(() => {
      const ids: string[] = [];
      let isLastClickedRelevant = false;

      if (isDefined(lastClickedNavigationMenuItemId)) {
        const lastClickedItem = navigationMenuItems.find(
          (item) => item.id === lastClickedNavigationMenuItemId,
        );

        if (isDefined(lastClickedItem)) {
          const lastClickedLink = getNavigationMenuItemComputedLink(
            lastClickedItem,
            objectMetadataItems,
            views,
          );
          const lastClickedObjectMetadataId =
            getObjectMetadataForNavigationMenuItem(
              lastClickedItem,
              objectMetadataItems,
              views,
            )?.id;

          const pathMatches = currentPathWithSearch === lastClickedLink;
          const objectMatchesOnShowPage =
            isOnRecordShowPage &&
            isDefined(lastClickedObjectMetadataId) &&
            lastClickedObjectMetadataId === currentObjectMetadataItem?.id;

          isLastClickedRelevant = pathMatches || objectMatchesOnShowPage;

          if (isLastClickedRelevant) {
            ids.push(lastClickedItem.id);
          }
        }
      }

      if (isOnRecordShowPage) {
        const recordItemIds = navigationMenuItems
          .filter((item) => {
            if (item.type !== NavigationMenuItemType.RECORD) {
              return false;
            }
            const link = getNavigationMenuItemComputedLink(
              item,
              objectMetadataItems,
              views,
            );
            return link === currentPath;
          })
          .map((item) => item.id);
        ids.push(...recordItemIds);
      }

      if (isLastClickedRelevant) {
        return {
          activeNavigationMenuItemIds: ids,
          objectMetadataIdForOpenedSection: null,
        };
      }

      if (isOnRecordShowPage) {
        const objectItemIds = navigationMenuItems
          .filter((item) => {
            if (item.type !== NavigationMenuItemType.OBJECT) {
              return false;
            }
            const itemObjectMetadataId = getObjectMetadataForNavigationMenuItem(
              item,
              objectMetadataItems,
              views,
            )?.id;
            return itemObjectMetadataId === currentObjectMetadataItem?.id;
          })
          .map((item) => item.id);
        ids.push(...objectItemIds);
      } else {
        const matchingItemIds = navigationMenuItems
          .filter((item) => {
            if (
              item.type === NavigationMenuItemType.LINK ||
              item.type === NavigationMenuItemType.FOLDER
            ) {
              return false;
            }
            const computedLink = getNavigationMenuItemComputedLink(
              item,
              objectMetadataItems,
              views,
            );
            return isLocationMatchingNavigationMenuItem(
              currentPath,
              currentPathWithSearch,
              item.type,
              computedLink,
            );
          })
          .map((item) => item.id);
        ids.push(...matchingItemIds);
      }

      return {
        activeNavigationMenuItemIds: ids,
        objectMetadataIdForOpenedSection:
          ids.length === 0 && isDefined(currentObjectMetadataItem)
            ? currentObjectMetadataItem.id
            : null,
      };
    }, [
      navigationMenuItems,
      lastClickedNavigationMenuItemId,
      objectMetadataItems,
      views,
      currentPath,
      currentPathWithSearch,
      isOnRecordShowPage,
      currentObjectMetadataItem,
    ]);

  return { activeNavigationMenuItemIds, objectMetadataIdForOpenedSection };
};
