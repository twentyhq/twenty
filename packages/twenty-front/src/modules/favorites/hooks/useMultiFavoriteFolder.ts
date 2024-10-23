import { useFavorites } from '@/favorites/hooks/useFavorites';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useFavoriteFoldersScopedStates } from './useFavoriteFoldersScopedStates';

type useMultiFavoriteFolderProps = {
  record?: ObjectRecord;
  objectNameSingular: string;
};

export const useMultiFavoriteFolder = ({
  record,
  objectNameSingular,
}: useMultiFavoriteFolderProps) => {
  const {
    favoriteFoldersIdsMultiSelectState,
    favoriteFolderMultiSelectFamilyState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const favoriteFoldersIdsMultiSelect = useRecoilValue(
    favoriteFoldersIdsMultiSelectState,
  );

  const { createFavorite, deleteFavorite, favorites } = useFavorites();

  const getFoldersByIds = useRecoilCallback(
    ({ snapshot }) =>
      (): FavoriteFolder[] => {
        return favoriteFoldersIdsMultiSelect
          .map((folderId) => {
            const folderValue = snapshot
              .getLoadable(favoriteFolderMultiSelectFamilyState(folderId))
              .getValue();

            return folderValue;
          })
          .filter((folder): folder is FavoriteFolder => folder !== undefined);
      },
    [favoriteFoldersIdsMultiSelect, favoriteFolderMultiSelectFamilyState],
  );

  const toggleFolderSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      async (folderId: string) => {
        const checkedIds = snapshot
          .getLoadable(favoriteFoldersMultiSelectCheckedState)
          .getValue();

        if (checkedIds.includes(folderId)) {
          if (folderId === 'no-folder') {
            const favoritesToDelete = favorites.filter(
              (favorite) =>
                !favorite.favoriteFolderId && favorite.recordId === record?.id,
            );

            for (const favorite of favoritesToDelete) {
              await deleteFavorite(favorite.id);
            }
          } else {
            const favoriteToDelete = favorites.find(
              (favorite) => favorite.favoriteFolderId === folderId,
            );

            if (isDefined(favoriteToDelete)) {
              await deleteFavorite(favoriteToDelete.id);
            }
          }

          set(
            favoriteFoldersMultiSelectCheckedState,
            checkedIds.filter((id) => id !== folderId),
          );
        } else if (isDefined(record)) {
          const folderIdToUse = folderId === 'no-folder' ? undefined : folderId;
          await createFavorite(record, objectNameSingular, folderIdToUse);

          set(favoriteFoldersMultiSelectCheckedState, [
            ...checkedIds,
            folderId,
          ]);
        }
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
    getFoldersByIds,
    toggleFolderSelection,
  };
};
