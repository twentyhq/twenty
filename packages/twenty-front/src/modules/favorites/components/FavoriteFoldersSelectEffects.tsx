import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedFavoritesFoldersData } from '@/favorites/hooks/usePrefetchedFavoritesFoldersData';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFavoriteFoldersScopedStates } from '../hooks/useFavoriteFoldersScopedStates';

type FavoriteFoldersMultiSelectEffectProps = {
  record?: ObjectRecord;
};

export const FavoriteFoldersMultiSelectEffect = ({
  record,
}: FavoriteFoldersMultiSelectEffectProps) => {
  const {
    favoriteFoldersIdsMultiSelectState,
    favoriteFolderMultiSelectFamilyState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();

  const favorites = useFavorites();
  const setCheckedState = useSetRecoilState(
    favoriteFoldersMultiSelectCheckedState,
  );

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
    if (isDefined(favoriteFolders)) {
      updateFolders(favoriteFolders);

      const folderIds = favoriteFolders.map((folder) => folder.id);
      if (!isDeeplyEqual(folderIds, favoriteFoldersIdsMultiSelect)) {
        setFavoriteFoldersIdsMultiSelect(folderIds);
      }
    }
  }, [
    favoriteFolders,
    favoriteFoldersIdsMultiSelect,
    setFavoriteFoldersIdsMultiSelect,
    updateFolders,
  ]);

  useEffect(() => {
    const targetId = record?.id;
    const checkedFolderIds = favorites
      .filter(
        (favorite) =>
          favorite.recordId === targetId && favorite.workspaceMemberId,
      )
      .map((favorite) => favorite.favoriteFolderId || 'no-folder');
    setCheckedState(checkedFolderIds);
  }, [favorites, setCheckedState, record?.id]);

  return null;
};
