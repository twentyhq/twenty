import { favoriteFolderPickerCheckedComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerCheckedComponentState';
import { favoriteFoldersComponentSelector } from '@/favorites/favorite-folder-picker/states/selectors/favoriteFoldersComponentSelector';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';

import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';
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
  const favoriteFoldersMultiSelectCheckedState =
    useRecoilComponentCallbackState(favoriteFolderPickerCheckedComponentState);

  const { sortedFavorites: favorites } = useFavorites();
  const { createFavorite } = useCreateFavorite();
  const { deleteFavorite } = useDeleteFavorite();

  const favoriteFolders = useRecoilComponentValue(
    favoriteFoldersComponentSelector,
  );

  const toggleFolderSelection = useRecoilCallback(
    ({ snapshot, set }) =>
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

        const checkedIds = snapshot
          .getLoadable(favoriteFoldersMultiSelectCheckedState)
          .getValue();

        const isAlreadyChecked = checkedIds.includes(folderId);

        if (isAlreadyChecked) {
          await deleteFavoriteForRecord(folderId === 'no-folder');

          const newCheckedIds = checkedIds.filter((id) => id !== folderId);
          set(favoriteFoldersMultiSelectCheckedState, newCheckedIds);
          return;
        }

        const folderIdToUse = folderId === 'no-folder' ? undefined : folderId;

        if (isDefined(record)) {
          await createFavorite(record, objectNameSingular, folderIdToUse);
        }

        const newCheckedIds = [...checkedIds, folderId];
        set(favoriteFoldersMultiSelectCheckedState, newCheckedIds);
      },
    [
      favoriteFoldersMultiSelectCheckedState,
      createFavorite,
      deleteFavorite,
      favorites,
      record,
      objectNameSingular,
    ],
  );

  return {
    favoriteFolders,
    toggleFolderSelection,
  };
};
