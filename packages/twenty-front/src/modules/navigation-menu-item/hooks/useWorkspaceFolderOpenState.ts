import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { isNonEmptyString } from '@sniptt/guards';

import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { currentNavigationMenuItemFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type UseWorkspaceFolderOpenStateParams = {
  folderId: string;
  navigationMenuItems: ProcessedNavigationMenuItem[];
};

export const useWorkspaceFolderOpenState = ({
  folderId,
  navigationMenuItems,
}: UseWorkspaceFolderOpenStateParams) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const currentViewPath = location.pathname + location.search;
  const isMobile = useIsMobile();

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
      const firstNonLinkItem = navigationMenuItems.find(
        (item) =>
          item.itemType !== NavigationMenuItemType.LINK &&
          isNonEmptyString(item.link),
      );
      if (isDefined(firstNonLinkItem?.link)) {
        navigate(firstNonLinkItem.link);
      }
    }
  };

  const selectedNavigationMenuItemIndex = navigationMenuItems.findIndex(
    (item) =>
      isLocationMatchingNavigationMenuItem(currentPath, currentViewPath, item),
  );

  return {
    isOpen,
    handleToggle,
    selectedNavigationMenuItemIndex,
  };
};
