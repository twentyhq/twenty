import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { activeNavigationMenuItemState } from '@/navigation-menu-item/common/states/activeNavigationMenuItemState';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { isNavigationMenuItemActive } from '@/navigation-menu-item/common/utils/isNavigationMenuItemActive';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

type UseNavigationMenuItemFolderOpenStateParams = {
  folderId: string;
  navigationMenuItems: NavigationMenuItem[];
};

export const useNavigationMenuItemFolderOpenState = ({
  folderId,
  navigationMenuItems,
}: UseNavigationMenuItemFolderOpenStateParams) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const currentViewPath = location.pathname + location.search;
  const isMobile = useIsMobile();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useAtomState(openNavigationMenuItemFolderIdsState);
  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const activeNavigationMenuItem = useAtomStateValue(
    activeNavigationMenuItemState,
  );

  const activeNavigationMenuItemIndices = useMemo(() => {
    const indices = new Set<number>();

    navigationMenuItems.forEach((item, index) => {
      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        item,
        objectMetadataItems,
        views,
      );
      if (!isDefined(objectMetadataItem)) {
        return;
      }

      if (
        isNavigationMenuItemActive({
          navigationMenuItem: item,
          objectMetadataItem,
          currentPath,
          currentPathWithSearch: currentViewPath,
          activeNavigationMenuItem,
          objectMetadataItems,
          views,
        })
      ) {
        indices.add(index);
      }
    });

    return indices;
  }, [
    navigationMenuItems,
    objectMetadataItems,
    views,
    currentPath,
    currentViewPath,
    activeNavigationMenuItem,
  ]);

  const isExplicitlyOpen = openNavigationMenuItemFolderIds.includes(folderId);
  const hasActiveChild = activeNavigationMenuItemIndices.size > 0;
  const isOpen = isExplicitlyOpen || hasActiveChild;

  const handleToggle = () => {
    if (isMobile) {
      setCurrentNavigationMenuItemFolderId((prev) =>
        prev === folderId ? null : folderId,
      );
    } else {
      setOpenNavigationMenuItemFolderIds((current) =>
        current.includes(folderId)
          ? current.filter((id) => id !== folderId)
          : [...current, folderId],
      );
    }

    if (!isOpen) {
      const firstNonLinkItem = navigationMenuItems.find((item) => {
        if (item.type === NavigationMenuItemType.LINK) {
          return false;
        }
        const computedLink = getNavigationMenuItemComputedLink(
          item,
          objectMetadataItems,
          views,
        );
        return isNonEmptyString(computedLink);
      });
      if (isDefined(firstNonLinkItem)) {
        const link = getNavigationMenuItemComputedLink(
          firstNonLinkItem,
          objectMetadataItems,
          views,
        );
        if (isNonEmptyString(link)) {
          navigate(link);
        }
      }
    }
  };

  return {
    isOpen,
    handleToggle,
    activeNavigationMenuItemIndices,
  };
};
