import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { useFavoriteFoldersScopedStates } from '../hooks/useFavoriteFoldersScopedStates';

export const FavoriteFoldersMultiSelectEffect = () => {
  const {
    favoriteFoldersIdsMultiSelectState,
    favoriteFolderMultiSelectFamilyState,
  } = useFavoriteFoldersScopedStates();

  const { favoriteFolder } = useFavoriteFolders();

  const [favoriteFoldersIdsMultiSelect, setFavoriteFoldersIdsMultiSelect] =
    useRecoilState(favoriteFoldersIdsMultiSelectState);

  const updateFolders = useRecoilCallback(
    ({ snapshot, set }) =>
      (folders: FavoriteFolder[]) => {
        folders.forEach((folder) => {
          const currentFolder = snapshot
            .getLoadable(favoriteFolderMultiSelectFamilyState(folder.id))
            .getValue();

          if (!isDeeplyEqual(folder, currentFolder)) {
            set(favoriteFolderMultiSelectFamilyState(folder.id), folder);
          }
        });
      },
    [favoriteFolderMultiSelectFamilyState],
  );

  useEffect(() => {
    if (isDefined(favoriteFolder)) {
      updateFolders(favoriteFolder);

      const folderIds = favoriteFolder.map((folder) => folder.id);
      if (!isDeeplyEqual(folderIds, favoriteFoldersIdsMultiSelect)) {
        setFavoriteFoldersIdsMultiSelect(folderIds);
      }
    }
  }, [
    favoriteFolder,
    favoriteFoldersIdsMultiSelect,
    setFavoriteFoldersIdsMultiSelect,
    updateFolders,
  ]);

  return null;
};
