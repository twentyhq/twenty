import { useCallback, useEffect } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { favoriteFolderIdsPickerComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderIdPickerComponentState';
import { favoriteFolderPickerCheckedComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerCheckedComponentState';
import { favoriteFolderPickerComponentFamilyState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerComponentFamilyState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedFavoritesFoldersData } from '@/favorites/hooks/usePrefetchedFavoritesFoldersData';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

type FavoriteFolderPickerEffectProps = {
  record?: ObjectRecord;
};

export const FavoriteFolderPickerEffect = ({
  record,
}: FavoriteFolderPickerEffectProps) => {
  const store = useStore();
  const [favoriteFolderIdsPicker, setFavoriteFolderIdsPicker] =
    useAtomComponentState(favoriteFolderIdsPickerComponentState);

  const favoriteFolderPickerFamily = useAtomComponentFamilyStateCallbackState(
    favoriteFolderPickerComponentFamilyState,
  );

  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();

  const { sortedFavorites: favorites } = useFavorites();
  const setFavoriteFolderPickerChecked = useSetAtomComponentState(
    favoriteFolderPickerCheckedComponentState,
  );

  const updateFolders = useCallback(
    (folders: FavoriteFolder[]) => {
      folders.forEach((folder) => {
        const atom = favoriteFolderPickerFamily(folder.id);
        const currentFolder = store.get(atom);

        if (!isDeeplyEqual(folder, currentFolder)) {
          store.set(atom, folder);
        }
      });
    },
    [favoriteFolderPickerFamily, store],
  );

  useEffect(() => {
    if (isDefined(favoriteFolders)) {
      updateFolders(favoriteFolders);

      const folderIds = favoriteFolders.map((folder) => folder.id);
      if (!isDeeplyEqual(folderIds, favoriteFolderIdsPicker)) {
        setFavoriteFolderIdsPicker(folderIds);
      }
    }
  }, [
    favoriteFolders,
    favoriteFolderIdsPicker,
    setFavoriteFolderIdsPicker,
    updateFolders,
  ]);

  useEffect(() => {
    const targetId = record?.id;
    const checkedFolderIds = favorites
      .filter(
        (favorite) =>
          favorite.recordId === targetId && favorite.forWorkspaceMemberId,
      )
      .map((favorite) => favorite.favoriteFolderId || 'no-folder');
    setFavoriteFolderPickerChecked(checkedFolderIds);
  }, [favorites, setFavoriteFolderPickerChecked, record?.id]);

  return null;
};
