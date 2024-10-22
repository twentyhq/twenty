import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useFavoriteFoldersScopedStates } from '../hooks/useFavoriteFoldersScopedStates';

export const FavoriteFoldersMultiSelectEffect = () => {
  const {
    favoriteFoldersIdsMultiSelectState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const { favoriteFolder } = useFavoriteFolders();

  const setFavoriteFoldersIdsMultiSelect = useSetRecoilState(
    favoriteFoldersIdsMultiSelectState,
  );
  const setCheckedFolderIds = useSetRecoilState(
    favoriteFoldersMultiSelectCheckedState,
  );

  useEffect(() => {
    if (isDefined(favoriteFolder)) {
      setFavoriteFoldersIdsMultiSelect(favoriteFolder);
    }
  }, [favoriteFolder, setFavoriteFoldersIdsMultiSelect]);

  // Reset checked folders when component unmounts
  useEffect(() => {
    return () => {
      setCheckedFolderIds([]);
    };
  }, [setCheckedFolderIds]);

  return null;
};
