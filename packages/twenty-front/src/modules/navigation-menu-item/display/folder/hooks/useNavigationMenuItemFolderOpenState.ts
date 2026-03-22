import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
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

  const isOpen = openNavigationMenuItemFolderIds.includes(folderId);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentNavigationMenuItemFolderId((prev) =>
        prev === folderId ? null : folderId,
      );
    } else {
      setOpenNavigationMenuItemFolderIds((current) =>
        isOpen
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

  const selectedNavigationMenuItemIndex = navigationMenuItems.findIndex(
    (item) => {
      const computedLink = getNavigationMenuItemComputedLink(
        item,
        objectMetadataItems,
        views,
      );
      return isLocationMatchingNavigationMenuItem(
        currentPath,
        currentViewPath,
        item.type,
        computedLink,
      );
    },
  );

  return {
    isOpen,
    handleToggle,
    selectedNavigationMenuItemIndex,
  };
};
