import { useFavorites } from '@/favorites/hooks/useFavorites';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useMemo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useFavoriteFoldersScopedStates } from './useFavoriteFoldersScopedStates';

type useMultiFavoriteFolderProps = {
  record?: ObjectRecord;
  objectNameSingular: string;
};

type FolderOperations = {
  getFoldersByIds: () => FavoriteFolder[];
  toggleFolderSelection: (folderId: string) => Promise<void>;
};

export const useMultiFavoriteFolder = ({
  record,
  objectNameSingular,
}: useMultiFavoriteFolderProps): FolderOperations => {
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
          .filter((folder): folder is FavoriteFolder => isDefined(folder));
      },
    [favoriteFoldersIdsMultiSelect, favoriteFolderMultiSelectFamilyState],
  );

  const toggleFolderSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      async (folderId: string) => {
        const targetId = record?.id;
        const targetObject = record;

        if (!isDefined(targetObject) || !isDefined(targetId)) {
          return;
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

  return useMemo(
    () => ({
      getFoldersByIds,
      toggleFolderSelection,
    }),
    [getFoldersByIds, toggleFolderSelection],
  );
};
