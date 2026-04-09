import { styled } from '@linaria/react';

import { NavigationMenuItemFolderContentDispatcherEffect } from '@/navigation-menu-item/edit/components/NavigationMenuItemFolderContentDispatcher';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledScrollableContent = styled.div`
  height: 100%;
  min-height: 0;
`;

export const MainNavigationDrawerNavigationContent = () => {
  const currentNavigationMenuItemFolderId = useAtomStateValue(
    currentNavigationMenuItemFolderIdState,
  );
  const { navigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();

  const openedNavigationMenuItemFolder = navigationMenuItemsByFolder.find(
    (folder) => folder.id === currentNavigationMenuItemFolderId,
  );

  return (
    <StyledScrollableContent>
      {openedNavigationMenuItemFolder ? (
        <NavigationMenuItemFolderContentDispatcherEffect
          folderName={openedNavigationMenuItemFolder.folderName}
          folderId={openedNavigationMenuItemFolder.id ?? ''}
          navigationMenuItems={
            openedNavigationMenuItemFolder.navigationMenuItems
          }
        />
      ) : (
        <MainNavigationDrawerScrollableItems />
      )}
    </StyledScrollableContent>
  );
};
