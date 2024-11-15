import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { IconFolder } from 'twenty-ui';

import { CurrentWorkspaceMemberFavorites } from '@/favorites/components/CurrentWorkspaceMemberFavorites';
import { FavoriteFolderHotkeyScope } from '@/favorites/constants/FavoriteFolderRightIconDropdownHotkeyScope';
import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';

type FavoriteFoldersProps = {
  isNavigationSectionOpen: boolean;
};

export const FavoriteFolders = ({
  isNavigationSectionOpen,
}: FavoriteFoldersProps) => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');

  const { createFolder, favoritesByFolder } = useFavoriteFolders();
  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilState(isFavoriteFolderCreatingState);

  const handleFolderNameChange = (value: string) => {
    setFolderName(value);
  };

  const handleSubmitFolder = async (value: string) => {
    if (!value) return false;

    setIsFavoriteFolderCreating(false);
    setFolderName('');
    await createFolder(value);
    return true;
  };

  const handleClickOutside = async (
    event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsFavoriteFolderCreating(false);
      return;
    }

    setIsFavoriteFolderCreating(false);
    setFolderName('');
    await createFolder(value);
  };

  const handleCancel = () => {
    setFolderName('');
    setIsFavoriteFolderCreating(false);
  };

  if (!isNavigationSectionOpen) {
    return null;
  }

  return (
    <>
      {isFavoriteFolderCreating && (
        <NavigationDrawerInput
          Icon={IconFolder}
          value={folderName}
          onChange={handleFolderNameChange}
          onSubmit={handleSubmitFolder}
          onCancel={handleCancel}
          onClickOutside={handleClickOutside}
          hotkeyScope={FavoriteFolderHotkeyScope.FavoriteFolderNavigationInput}
        />
      )}
      {favoritesByFolder.map((folder) => (
        <CurrentWorkspaceMemberFavorites
          key={folder.folderId}
          folder={folder}
          isGroup={favoritesByFolder.length > 1}
          isOpen={activeFolderId === folder.folderId}
          onToggle={(folderId) => {
            setActiveFolderId((currentId) =>
              currentId === folderId ? null : folderId,
            );
          }}
        />
      ))}
    </>
  );
};
