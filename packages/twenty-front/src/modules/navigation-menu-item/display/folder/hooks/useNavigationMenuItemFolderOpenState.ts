import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { lastClickedNavigationMenuItemIdState } from '@/navigation-menu-item/common/states/lastClickedNavigationMenuItemIdState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

type UseNavigationMenuItemFolderOpenStateParams = {
  folderId: string;
  folderChildrenNavigationMenuItems: NavigationMenuItem[];
};

export const useNavigationMenuItemFolderOpenState = ({
  folderId,
  folderChildrenNavigationMenuItems,
}: UseNavigationMenuItemFolderOpenStateParams) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useAtomState(openNavigationMenuItemFolderIdsState);
  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();
  const setLastClickedNavigationMenuItemId = useSetAtomState(
    lastClickedNavigationMenuItemIdState,
  );

  const [isManuallyClosed, setIsManuallyClosed] = useState(false);

  const isExplicitlyOpen = openNavigationMenuItemFolderIds.includes(folderId);
  const hasActiveChild = folderChildrenNavigationMenuItems.some((item) =>
    activeNavigationMenuItemIds.includes(item.id),
  );
  const isOpen = isExplicitlyOpen || (hasActiveChild && !isManuallyClosed);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentNavigationMenuItemFolderId((prev) =>
        prev === folderId ? null : folderId,
      );
    } else {
      setOpenNavigationMenuItemFolderIds((current) =>
        isOpen
          ? current.filter((id) => id !== folderId)
          : current.includes(folderId)
            ? current
            : [...current, folderId],
      );
      setIsManuallyClosed(isOpen);
    }

    if (!isOpen) {
      const firstNonLinkItem = folderChildrenNavigationMenuItems.find(
        (item) => {
          if (item.type === NavigationMenuItemType.LINK) {
            return false;
          }
          const computedLink = getNavigationMenuItemComputedLink(
            item,
            objectMetadataItems,
            views,
          );
          return isNonEmptyString(computedLink);
        },
      );
      if (isDefined(firstNonLinkItem)) {
        const link = getNavigationMenuItemComputedLink(
          firstNonLinkItem,
          objectMetadataItems,
          views,
        );
        if (isNonEmptyString(link)) {
          setLastClickedNavigationMenuItemId(firstNonLinkItem.id);
          navigate(link);
        }
      }
    }
  };

  return {
    isOpen,
    handleToggle,
    hasActiveChild,
  };
};
