import { useState } from 'react';
import { IconFolder } from 'twenty-ui/display';

import { CurrentWorkspaceMemberNavigationMenuItems } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItems';
import { useCreateNavigationMenuItemFolder } from '@/navigation-menu-item/hooks/useCreateNavigationMenuItemFolder';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { isNavigationMenuItemFolderCreatingStateV2 } from '@/navigation-menu-item/states/isNavigationMenuItemFolderCreatingStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';

type NavigationMenuItemFoldersProps = {
  isNavigationSectionOpen: boolean;
};

export const NavigationMenuItemFolders = ({
  isNavigationSectionOpen,
}: NavigationMenuItemFoldersProps) => {
  const [newFolderName, setNewFolderName] = useState('');

  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const { createNewNavigationMenuItemFolder } =
    useCreateNavigationMenuItemFolder();

  const [
    isNavigationMenuItemFolderCreating,
    setIsNavigationMenuItemFolderCreating,
  ] = useRecoilStateV2(isNavigationMenuItemFolderCreatingStateV2);

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

  if (!isNavigationSectionOpen) {
    return null;
  }

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
        <CurrentWorkspaceMemberNavigationMenuItems
          key={folder.id}
          folder={folder}
          isGroup={userNavigationMenuItemsByFolder.length > 1}
        />
      ))}
    </>
  );
};
