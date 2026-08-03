import { useState } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type UseNavigationMenuItemFolderOpenStateParams = {
  folderId: string;
  folderChildrenNavigationMenuItems: NavigationMenuItem[];
};

export const useNavigationMenuItemFolderOpenState = ({
  folderId,
  folderChildrenNavigationMenuItems,
}: UseNavigationMenuItemFolderOpenStateParams) => {
  const isMobile = useIsMobile();

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useAtomState(openNavigationMenuItemFolderIdsState);
  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();

  const [isManuallyClosed, setIsManuallyClosed] = useState(false);

  const isExplicitlyOpen = openNavigationMenuItemFolderIds.includes(folderId);
  const activeChildIndex = folderChildrenNavigationMenuItems.findIndex((item) =>
    activeNavigationMenuItemIds.includes(item.id),
  );
  const hasActiveChild = activeChildIndex !== -1;
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
  };

  return {
    isOpen,
    handleToggle,
    hasActiveChild,
    activeChildIndex,
  };
};
