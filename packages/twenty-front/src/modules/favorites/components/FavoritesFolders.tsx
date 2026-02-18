import { CurrentWorkspaceMemberFavorites } from '@/favorites/components/CurrentWorkspaceMemberFavorites';
import { useCreateFavoriteFolder } from '@/favorites/hooks/useCreateFavoriteFolder';
import { useFavoritesByFolder } from '@/favorites/hooks/useFavoritesByFolder';
import { isFavoriteFolderCreatingStateV2 } from '@/favorites/states/isFavoriteFolderCreatingStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { useState } from 'react';
import { IconFolder } from 'twenty-ui/display';

type FavoriteFoldersProps = {
  isNavigationSectionOpen: boolean;
};

export const FavoriteFolders = ({
  isNavigationSectionOpen,
}: FavoriteFoldersProps) => {
  const [newFolderName, setNewFolderName] = useState('');

  const { favoritesByFolder } = useFavoritesByFolder();
  const { createNewFavoriteFolder } = useCreateFavoriteFolder();

  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilStateV2(isFavoriteFolderCreatingStateV2);

  const handleFavoriteFolderNameChange = (value: string) => {
    setNewFolderName(value);
  };

  const handleSubmitFavoriteFolderCreation = async (value: string) => {
    if (value === '') return;

    setIsFavoriteFolderCreating(false);
    setNewFolderName('');
    await createNewFavoriteFolder(value);
    return true;
  };

  const handleClickOutside = async (
    _event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsFavoriteFolderCreating(false);
      return;
    }

    setIsFavoriteFolderCreating(false);
    setNewFolderName('');
    await createNewFavoriteFolder(value);
  };

  const handleCancelFavoriteFolderCreation = () => {
    setNewFolderName('');
    setIsFavoriteFolderCreating(false);
  };

  if (!isNavigationSectionOpen) {
    return null;
  }

  return (
    <>
      {isFavoriteFolderCreating && (
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerInput
            Icon={IconFolder}
            value={newFolderName}
            onChange={handleFavoriteFolderNameChange}
            onSubmit={handleSubmitFavoriteFolderCreation}
            onCancel={handleCancelFavoriteFolderCreation}
            onClickOutside={handleClickOutside}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
      )}
      {favoritesByFolder.map((folder) => (
        <CurrentWorkspaceMemberFavorites
          key={folder.folderId}
          folder={folder}
          isGroup={favoritesByFolder.length > 1}
        />
      ))}
    </>
  );
};
