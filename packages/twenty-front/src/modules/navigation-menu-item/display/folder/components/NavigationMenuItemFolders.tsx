import { useState } from 'react';
import { IconFolder } from 'twenty-ui/display';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { isNavigationMenuItemFolderCreatingState } from '@/navigation-menu-item/common/states/isNavigationMenuItemFolderCreatingState';
import { NavigationMenuItemFolder } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder';
import { useCreateNavigationMenuItemFolder } from '@/navigation-menu-item/display/folder/hooks/useCreateNavigationMenuItemFolder';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const NavigationMenuItemFolders = () => {
  const [newFolderName, setNewFolderName] = useState('');

  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const { createNewNavigationMenuItemFolder } =
    useCreateNavigationMenuItemFolder();

  const [
    isNavigationMenuItemFolderCreating,
    setIsNavigationMenuItemFolderCreating,
  ] = useAtomState(isNavigationMenuItemFolderCreatingState);

  const handleNavigationMenuItemFolderNameChange = (value: string) => {
    setNewFolderName(value);
  };

  const handleSubmitNavigationMenuItemFolderCreation = async (
    value: string,
  ) => {
    if (value === '') return;

    setIsNavigationMenuItemFolderCreating(false);
    setNewFolderName('');
    await createNewNavigationMenuItemFolder(value);
    return true;
  };

  const handleClickOutside = async (
    _event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsNavigationMenuItemFolderCreating(false);
      return;
    }

    setIsNavigationMenuItemFolderCreating(false);
    setNewFolderName('');
    await createNewNavigationMenuItemFolder(value);
  };

  const handleCancelNavigationMenuItemFolderCreation = () => {
    setNewFolderName('');
    setIsNavigationMenuItemFolderCreating(false);
  };

  return (
    <>
      {isNavigationMenuItemFolderCreating && (
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerInput
            Icon={IconFolder}
            value={newFolderName}
            onChange={handleNavigationMenuItemFolderNameChange}
            onSubmit={handleSubmitNavigationMenuItemFolderCreation}
            onCancel={handleCancelNavigationMenuItemFolderCreation}
            onClickOutside={handleClickOutside}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
      )}
      {userNavigationMenuItemsByFolder.map((folder) => (
        <NavigationMenuItemFolder
          key={folder.id}
          folderId={folder.id}
          folderName={folder.folderName}
          navigationMenuItems={folder.navigationMenuItems}
          section={NavigationSections.FAVORITES}
          isGroup={userNavigationMenuItemsByFolder.length > 1}
        />
      ))}
    </>
  );
};
