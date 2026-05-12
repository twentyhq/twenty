import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { lastClickedNavigationMenuItemIdState } from '@/navigation-menu-item/common/states/lastClickedNavigationMenuItemIdState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
  const views = useAtomStateValue(viewsSelector);
  const { activeObjectMetadataItems, objectMetadataItems } =
    useFilteredObjectMetadataItems();

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

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { activeNavigationMenuItemIds, objectMetadataIdForOpenedSection } =
    useMemo(() => {
      if (isDefined(lastClickedNavigationMenuItemId)) {
        const lastClickedItem = navigationMenuItems.find(
          (item) => item.id === lastClickedNavigationMenuItemId,
        );

        if (isDefined(lastClickedItem)) {
          const lastClickedNavigationMenuItemLink =
            getNavigationMenuItemComputedLink(
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

          const pathMatches =
            currentPathWithSearch === lastClickedNavigationMenuItemLink;
          const objectMatchesOnShowPage =
            isOnRecordShowPage &&
            isDefined(lastClickedObjectMetadataId) &&
            lastClickedObjectMetadataId === currentObjectMetadataItem?.id;

          const isLastClickedNavigationMenuItemRelevant =
            pathMatches || objectMatchesOnShowPage;
          if (isLastClickedNavigationMenuItemRelevant) {
            return {
              activeNavigationMenuItemIds: [lastClickedItem.id],
              objectMetadataIdForOpenedSection: null,
            };
          }
        }
      }

      if (isOnRecordShowPage) {
        const matchingRecordNavigationMenuItemIds = navigationMenuItems
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

        const matchingObjectNavigationMenuItemIds = navigationMenuItems
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

        const activeNavigationMenuItemIds = [
          ...matchingRecordNavigationMenuItemIds,
          ...matchingObjectNavigationMenuItemIds,
        ];

        return {
          activeNavigationMenuItemIds,
          objectMetadataIdForOpenedSection:
            activeNavigationMenuItemIds.length === 0
              ? currentObjectMetadataItem?.id
              : null,
        };
      }

      const matchingViewNavigationMenuItemIds = navigationMenuItems
        .filter(
          (item) =>
            item.type === NavigationMenuItemType.VIEW &&
            isDefined(contextStoreCurrentViewId) &&
            item.viewId === contextStoreCurrentViewId,
        )
        .map((item) => item.id);

      if (matchingViewNavigationMenuItemIds.length > 0) {
        return {
          activeNavigationMenuItemIds: matchingViewNavigationMenuItemIds,
          objectMetadataIdForOpenedSection: null,
        };
      }

      const matchingObjectNavigationMenuItemIds = navigationMenuItems
        .filter(
          (item) =>
            item.type === NavigationMenuItemType.OBJECT &&
            item.targetObjectMetadataId === currentObjectMetadataItem?.id,
        )
        .map((item) => item.id);

      return {
        activeNavigationMenuItemIds: matchingObjectNavigationMenuItemIds,
        objectMetadataIdForOpenedSection:
          matchingObjectNavigationMenuItemIds.length === 0 &&
          isDefined(currentObjectMetadataItem)
            ? currentObjectMetadataItem.id
            : null,
      };
    }, [
      navigationMenuItems,
      lastClickedNavigationMenuItemId,
      objectMetadataItems,
      views,
      currentPathWithSearch,
      currentPath,
      currentObjectMetadataItem,
      isOnRecordShowPage,
      contextStoreCurrentViewId,
    ]);

  return { activeNavigationMenuItemIds, objectMetadataIdForOpenedSection };
};
