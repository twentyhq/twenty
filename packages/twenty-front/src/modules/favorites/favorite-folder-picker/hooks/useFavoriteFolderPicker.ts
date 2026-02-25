import { favoriteFolderPickerCheckedComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerCheckedComponentState';
import { favoriteFoldersComponentSelector } from '@/favorites/favorite-folder-picker/states/selectors/favoriteFoldersComponentSelector';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';

import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type useFavoriteFolderPickerProps = {
  record?: ObjectRecord;
  objectNameSingular: string;
};

type useFavoriteFolderPickerReturnType = {
  favoriteFolders: FavoriteFolder[];
  toggleFolderSelection: (folderId: string) => Promise<void>;
};

export const useFavoriteFolderPicker = ({
  record,
  objectNameSingular,
}: useFavoriteFolderPickerProps): useFavoriteFolderPickerReturnType => {
  const favoriteFoldersMultiSelectChecked = useAtomComponentStateCallbackState(
    favoriteFolderPickerCheckedComponentState,
  );

  const { sortedFavorites: favorites } = useFavorites();
  const { createFavorite } = useCreateFavorite();
  const { deleteFavorite } = useDeleteFavorite();

  const favoriteFolders = useAtomComponentSelectorValue(
    favoriteFoldersComponentSelector,
  );

  const store = useStore();

  const toggleFolderSelection = useCallback(
    async (folderId: string) => {
      const targetId = record?.id;
      const targetObject = record;

      if (!isDefined(targetObject) || !isDefined(targetId)) {
        throw new Error(
          `Cannot toggle folder selection: record ${
            !isDefined(targetObject) ? 'object' : 'id'
          } is not defined`,
        );
      }

      const deleteFavoriteForRecord = async (isUnorganized: boolean) => {
        const favoriteToDelete = favorites.find(
          (favorite) =>
            favorite.recordId === targetId &&
            (isUnorganized
              ? !favorite.favoriteFolderId
              : favorite.favoriteFolderId === folderId),
        );

        if (!isDefined(favoriteToDelete)) {
          return;
        }

        await deleteFavorite(favoriteToDelete.id);
      };

      const checkedIds = store.get(favoriteFoldersMultiSelectChecked);

      const isAlreadyChecked = checkedIds.includes(folderId);

      if (isAlreadyChecked) {
        await deleteFavoriteForRecord(folderId === 'no-folder');

        const newCheckedIds = checkedIds.filter((id) => id !== folderId);
        store.set(favoriteFoldersMultiSelectChecked, newCheckedIds);
        return;
      }

      const folderIdToUse = folderId === 'no-folder' ? undefined : folderId;

      if (isDefined(record)) {
        await createFavorite(record, objectNameSingular, folderIdToUse);
      }

      const newCheckedIds = [...checkedIds, folderId];
      store.set(favoriteFoldersMultiSelectChecked, newCheckedIds);
    },
    [
      favoriteFoldersMultiSelectChecked,
      createFavorite,
      deleteFavorite,
      favorites,
      record,
      objectNameSingular,
      store,
    ],
  );

  return {
    favoriteFolders,
    toggleFolderSelection,
  };
};
